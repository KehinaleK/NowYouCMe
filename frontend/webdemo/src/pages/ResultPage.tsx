import {Link} from "react-router-dom";

export function ResultPage() {
    return (
        <main>
            <header>
                <h1>Result Page</h1>
                <p>
                    View your analysis results here.
                </p>
            </header>
            <section>
                <h2>Analysis Results</h2>
                <button>Download the result here</button>
            </section>
            <section>
                <h2> Go Home</h2>
                <Link to="/">
                    <button>Go to Home Page</button>
                </Link>
            </section>
        </main>

    );
}
export default ResultPage;