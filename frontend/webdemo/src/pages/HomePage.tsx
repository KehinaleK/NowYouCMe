import { Link } from "react-router-dom";

export function HomePage() {
    return (
        <main>
            <header>
                <h1>Touch2See</h1>
                <p>
                    Upload a football match video and generate positional analysis results.
                </p>
            </header>

            <section>
                <h2>Get started</h2>

                <div>
                    <Link to="/upload">
                        <button>Upload your match video</button>
                    </Link>
                    <Link to="/help">
                        <button>Q&A</button>
                    </Link>
                </div>
            </section>

            <section>
                <h2>How it works</h2>
                <ol>
                    <li>Upload a football match video</li>
                    <li>Correct positions and configure processing</li>
                    <li>Download the analysis result</li>
                </ol>
            </section>
        </main>
    );
}

export default HomePage;