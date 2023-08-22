import React from "react";

import "./NotFound404Page.scss";

export default function NotFound404Page(): React.ReactElement {
    return (
        <main id="not-found-404-page">
            <section>
                <h1 className="big-header">Whoooooooops! 404</h1>
                <h2>Seems like you're lost, buddy.</h2>
                <p>The section you're looking for either doesn't exist, or is not implemented yet.</p>
            </section>
        </main>
    );
}