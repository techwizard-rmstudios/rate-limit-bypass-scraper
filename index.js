const { fetchPageData, fetchProfileData } = require("./scraper");
const { connect, insertProfile, findProfile, getLastPage, destroy } = require("./mysql");

(async () => {
  await connect();
  let page = await getLastPage();
  while (page < 200) {
    console.log(`Scraping from page ${page}...`);
    const items = await fetchPageData(page, "promo_asc");
    if (items.length) {
      for (const item of items) {
        if ((await findProfile(item)) > 0) continue;
        const profile = await fetchProfileData(item);
        insertProfile(profile, page);
      }
      page = page + 1;
    }
  }
  await destroy();
})();
