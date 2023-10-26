import RunScraperButton from "./components/RunScraperButton";
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
let counter = 0;

interface ownProps {
    searchParams: any;
}

export default function Home({ searchParams }: ownProps) {
    // const searchParams = useSearchParams();

    if (searchParams?.runScraperButton) {
        console.log("searchParams", searchParams);

        runScraper();
    }
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <RunScraperButton />
        </main>
    );
}

const runScraper = async () => {
    // launch puppeteer browser

    const browser = await puppeteer.launch({
        headless: false,
        // defaultViewport: null,
        // args: ["--start-maximized"],
    });

    const page = await browser.newPage();

    // set browser viewport to 1300x600
    await page.setViewport({ width: 1300, height: 600 });

    // go to url

    const endpoint = "http://books.toscrape.com/";

    await page.goto(endpoint, { waitUntil: "domcontentloaded" });

    // wait 3 seconds
    wait(3000);

    // click category
    await clickCategory(page);

    // wait 3 seconds
    wait(3000);

    // extract data
    await scrapeData(page);
};

// wait function
const wait = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const clickCategory = async (page: any) => {
    const catAttr = "catalogue/category/books/mystery_3/index.html";
    if (!(await page.$(`a[href="${catAttr}"]`))) {
        counter++;
        if (counter < 3) {
            console.log(
                `can\'t find category selector... Running retry number${counter}`
            );
            await wait(2000);
            await clickCategory(page);
        } else {
            console.log(`Unable to find category selector... Moving on.`);
            counter = 0;
        }
        return;
    }
    counter = 0;
    await page.click(`a[href="${catAttr}"]`);
};

// scrape data
const scrapeData = async (page: any) => {
    const $ = cheerio.load(await page.content());

    if (!(await page.$("ol.row li"))) {
        counter++;
        console.log(
            `can\'t find category selector... Running retry number${counter}`
        );
        if (counter < 3) {
            // wait 2 seconds and try again
            await wait(2000);
            await scrapeData(page);
        } else {
            console.log(`Unable to find category selector... Moving on.`);
            counter = 0;
        }
    }

    // get li tags
    const liTags = $("ol.row li");

    let booksArr: {
        imageUrl: string;
        starRating: string;
        title: string;
        price: string;
        availability: string;
    }[] = [];
    // extract data for  each book
    const baseUrl = "http://books.toscrape.com/";
    liTags.each((i: any, el: any) => {
        // img태그안의 scr속성의 내용을 가져옴.
        let imageUrl = $(el).find("img").attr("src");
        imageUrl = imageUrl.replaceAll("../", "").trim();
        imageUrl = baseUrl + imageUrl;

        let starRating = $(el).find("p.star-rating").attr("class");
        starRating = starRating.replaceAll("star-rating", "").trim();

        // h3태그 하위의 text를 가져옴.
        const title = $(el).find("h3").text().trim();

        // title을 가져오는 또다른 방법
        // h3태그안의 a태그안의 title속성의 내용을 가져옴.
        // const title = $(el).find("h3 a").attr("title").trim();

        // p태그의 price_color클래스의 text를 가져옴.
        const price = $(el).find("p.price_color").text().trim();

        const availability = $(el).find("p.instock.availability").text().trim();
        // 이런형식으로도 가져올 수 있음.
        /*     const availability = $(el)
            .find('p[class="instock availability"]')
            .text()
            .trim(); */

        const book = {
            imageUrl,
            starRating,
            title,
            price,
            availability,
        };
        booksArr.push(book);
    });
    console.log("booksArr: ", booksArr);
};
