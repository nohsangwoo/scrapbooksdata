"use client";

import { useRouter } from "next/navigation";

const RunScraperButton = () => {
    const router = useRouter();
    const handleClick = () => {
        router.refresh();
        router.push(`/?runScraperButton=${true}`);
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className=" bg-blue-500 text-white rounded-lg py-3 px-5"
            >
                Run Scraper
            </button>
        </div>
    );
};

export default RunScraperButton;
