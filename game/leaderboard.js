export class Leaderboard {
    constructor(engine) {
        this.engine = engine;

        this.dbURL = "https://dino.mreng.cf/api.php";

        this.tableBody = document.querySelector(".leaderboard-container table");

        this.scores = [];
    }

    async FetchScores() {
        try {
            const response = await fetch(`${this.dbURL}`);
            const data = await response.json();
            console.log("Fetched scores", data);

            if (!data) return;

            this.scores = Object.values(data).sort((a, b) => b.score - a.score);
            this.Render(this.scores);
        } catch (e) {
            console.error("Leaderboard fetch failed", e);
        }
    }

    async SubmitScore(name, score) {
        try {
            await fetch(this.dbURL, {
                method: 'POST',
                body: JSON.stringify({ name, score }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (this.scores[this.scores.length - 1].score < score) {
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
