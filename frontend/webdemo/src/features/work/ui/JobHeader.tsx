type Props = {
    jobId?: string;
    status: string;
};

export function JobHeader({ jobId, status }: Props) {
    return (
        <header>
            <h1>Work</h1>
            <p>Job ID: {jobId}</p>
            <p>Status: {status}</p>
        </header>
    );
}