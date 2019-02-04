const puppeteer = require('puppeteer');
const asTable = require ('as-table').configure ({dash: '', delimiter: '\t'})

async function getAllEmplyes(browser, url) {
    const page = await browser.newPage();
    await page.goto(url)

    return page.evaluate(() => {
        let elements = Array.from(document.querySelectorAll('.lista-osob'));
        let anchors = Array.from(elements[0].getElementsByTagName('a'));
        return anchors.map((a) => a.href).filter((a) => a.includes('osoba'))
    });
}

async function getInfo(browser, urlList) {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(true)
    let list = []
    for (let url of urlList) {
        await page.goto(url)
        await page.waitForSelector('.email');
        let obj = await page.evaluate(() => {
            let nameAndTitle = document.getElementsByTagName('h1')[0].innerText;
            let name = nameAndTitle.split(',')[0]
            let title = nameAndTitle.split(',')[1]
            let email = document.getElementsByClassName('email')[0].innerText;
            let faculty = document.getElementsByClassName('organization-unit')[0].innerText;
            let role = Array.from(document.getElementsByClassName('title')).map(r => r.innerText).join(', ');
            return {title, name, email, faculty, role}
        })
        list.push(obj)
    }
    return list
}

(async () => {
    const browser = await puppeteer.launch();

    {
        const deansUrl = 'https://skos.agh.edu.pl/search/?nazwisko=&imie=&tytul=&id_status=&grupa=&stanowisko=&funkcja=8&email=&jednostka=&pawilon=&pokoj=&telefon=&cialo='
        const deansUrlList = await getAllEmplyes(browser, deansUrl)
        const deansList = await getInfo(browser, deansUrlList)
        console.log(asTable(deansList))
    }

    console.log('')
    {
        const deansUrl = 'https://skos.agh.edu.pl/search/?nazwisko=&imie=&tytul=&id_status=&grupa=&stanowisko=&funkcja=9&email=&jednostka=&pawilon=&pokoj=&telefon=&cialo='
        const deansUrlList = await getAllEmplyes(browser, deansUrl)
        const deansList = await getInfo(browser, deansUrlList)
        console.log(asTable(deansList))
    }



    await browser.close();
})();