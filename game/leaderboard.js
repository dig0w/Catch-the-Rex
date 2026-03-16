export class Leaderboard {
    static dbURL = "https://dino.mreng.cf/api.php";

    #tableBody = null;
    #scores = [];
    #engine = null;

    constructor(engine) {
        this.#engine = engine;

        this.#tableBody = document.querySelector(".leaderboard-container table");
    }

    async FetchScores() {
        try {
            const response = await fetch(`${Leaderboard.dbURL}?scores=10`);
            const data = await response.json();
            if (!data) return;

            this.#scores = data;
            this.Render(this.#scores);
        } catch (e) {
            console.error("Leaderboard fetch failed", e);
        }
    }

    async SubmitScore(name) {
        const cleanName = name ? name.trim().slice(0, 20) : "Anonymous";
        const cleanScore = this.#engine.score > 99999 ? 99999 : this.#engine.score;

        try {
            const ticketRes = await fetch(`${Leaderboard.dbURL}?ticket=1`, {
                credentials: "include"
            });
            const ticket = await ticketRes.json();

            const secret = "f1ce7bdcddb3a098f1684d46db62610c";
            const rawString = `${cleanName}:${cleanScore}:${ticket}:${secret}`;

            // Convert the modern UTF-8 string into an array of safe, raw bytes
            const utf8Bytes = new TextEncoder().encode(rawString);

            // Convert those bytes into a string btoa() can handle, then encode it
            const signature = btoa(String.fromCharCode(...utf8Bytes));

            await fetch(Leaderboard.dbURL, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ name: cleanName, score: cleanScore, ticket, sig: signature }),
                headers: { "Content-Type": "application/json" }
            });

            if (this.#scores[this.#scores.length - 1].score < cleanScore || this.#scores.length < 10) {
                await this.FetchScores();
            }
        } catch (e) {
            console.error("Score submission failed", e);
        }
    }

    Render(scores) {
        this.#tableBody.innerHTML = "";

        scores.forEach(entry => {
            const row = `
                <tr>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                </tr>`;
            this.#tableBody.innerHTML += row;
        });
    }
}
