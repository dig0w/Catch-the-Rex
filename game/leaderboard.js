export class Leaderboard {
    constructor(engine) {
        this.engine = engine;

        this.dbURL = "https://dino.mreng.cf/api.php";

        this.tableBody = document.querySelector(".leaderboard-container table");

        this.scores = [];
    }

    async FetchScores() {
        try {
            const response = await fetch(`${this.dbURL}?scores=10`);
            const data = await response.json();
            console.log("Fetched scores", data);

            if (!data) return;

            // this.scores = Object.values(data).sort((a, b) => b.score - a.score);
            this.scores = data;
            this.Render(this.scores);
        } catch (e) {
            console.error("Leaderboard fetch failed", e);
        }
    }

    async SubmitScore(name, score) {
        const cleanName = name.trim().slice(0, 20) || "Anonymous";
        const cleanScore = score > 99999 ? 99999 : score;

        try {
            const ticketRes = await fetch(`${this.dbURL}?ticket=1`, {
                credentials: 'include'
            });
            const ticket = await ticketRes.json();
            console.log(ticket);

            const secret = "f1ce7bdcddb3a098f1684d46db62610c";
            const signature = btoa(`${cleanName}:${cleanScore}:${ticket}:${secret}`);

            await fetch(this.dbURL, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ name: cleanName, score: cleanScore, ticket, sig: signature }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (this.scores[this.scores.length - 1].score < cleanScore || this.scores.length < 10) {
                await this.FetchScores();
            }
        } catch (e) {
            console.error("Score submission failed", e);
        }
    }

    Render(scores) {
        this.tableBody.innerHTML = "";

        scores.forEach(entry => {
            const row = `
                <tr>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                </tr>`;
            this.tableBody.innerHTML += row;
        });
    }
}
