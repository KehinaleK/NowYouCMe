import { Link } from "react-router-dom";

export function HelpPage() {
    return (
        <main>
            <header>
                <h1>Help Page</h1>
                <p>
                    Learn how to use Touch2See demo and get answers to common questions.
                </p>
            </header>

            <section>
                <h2>Q&A</h2>

                <ol>
                    <li>How to upload a football match video ?</li>
                    <li>Go to Home and select Upload a video</li>
                    <li>Select the correct video file : *.mp4</li>
                </ol>
            </section>

            <section>
                <h2>How it works</h2>
                <ol>
                    <li>Upload a football match video</li>
                    <li>Correct positions and configure processing</li>
                    <li>Download the analysis result</li>
                </ol>
            </section>
            <section>
                <Link to="/">
                    <button>Go to Home Page</button>
                </Link>
            </section>
        </main>
    );
}

export default HelpPage;