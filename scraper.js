const qs = require("qs");
const axios = require("axios");
const cheerio = require("cheerio");

const cookie = "as_id=3a56ed77dd70c5706ca908855c834059; stats=1; langue_selected=en; tarteaucitron=!gtag=true; _ga=GA1.1.427770331.1726764319; PHPSESSID=jarqgrmibmdu61smvhv4p0dg3o; _ga_Y2H5NPKPKT=GS1.1.1726767534.2.1.1726770622.0.0.0; PHPSESSID=5mnmqkmb40ghe8mlgs261ckg0j; as_id=d8af29d892f2fc988a45155213d9411f; langue_selected=en";
const baseURL = "https://www.force-edc.com";
const pageURL = `${baseURL}/annuaire/ajax/loadresult`;
const profileURL = (url) => `${baseURL}${url}`;

const profileConfig = (url) => ({
  method: "get",
  maxBodyLength: Infinity,
  url: url,
  headers: {
    Cookie: cookie,
  },
});

const clearStr = (str) => str.replace(/\t+/g, " ").replace(/\n+/g, " ").replace(/\s\s+/g, " ").replace(/'/g, "''").trim();
const getName = (full_name) => {
  const nameParts = full_name.trim().split(" ");
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(" ");

  return {
    first_name: first_name,
    last_name: last_name,
    full_name,
  };
};

const fetchProfileData = async (url) => {
  try {
    const response = await axios.request(profileConfig(url));
    const htmlData = response.data;
    const $ = cheerio.load(htmlData);

    const name = getName(clearStr($(".infos-nom").text()));
    const first_name = name.first_name;
    const last_name = name.last_name;
    const full_name = name.full_name;
    const profile_url = url;
    const avatar = baseURL + $(".photo-holder").find("img").attr("src");
    const resumeBuff = $(".telecharger_cv").find("a").attr("href");
    const resume = resumeBuff ? baseURL + resumeBuff : "";

    const email = clearStr($("#adresse_perso_mail").text());
    const phone = clearStr($("#adresse_perso_phone").text()).replace("phone ", "");
    const address = clearStr($("#adresse_perso_map").text());
    const linkedin = clearStr($("#linkedin").text());
    const facebook = clearStr($("#facebook").text());
    const twitter = clearStr($("#twitter").text());
    const instagram = clearStr($("#instagram").text());
    const tumblr = clearStr($("#tumblr").text());
    const skype = clearStr($("#skype").text());

    const content = $(".ep-content-left").text();
    const emailsBuff = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const phonesBuff = content.match(/(\+?\d{1,3}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?)?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}/g) || [];
    const emails = [...new Set(emailsBuff)];
    const phones = [...new Set(phonesBuff.filter((phone) => phone.length > 9))];

    const career = $(".ep-section-parcours");
    const current_company = clearStr(career.find(".entreprise").first().text());
    const current_position = clearStr(career.find(".title").first().text());

    const infos = $(".infos-complement").text();
    const curriculumBuff = infos.match(/([\w\- ]+, \d{4})/g);
    const curriculum = curriculumBuff ? curriculumBuff[0].split(", ") : ["", ""];
    const graduation_specialization = clearStr(curriculum[0]);
    const graduation_year = clearStr(curriculum[1]);

    const social = clearStr($(".ep-section-social").text());
    const dobBuff = social.match(/(\d{2})\/(\d{2})\/(\d{4})/g);
    const dob = dobBuff ? clearStr(dobBuff[0]) : "Unknown";

    const profile = { first_name, last_name, full_name, dob, graduation_specialization, graduation_year, email, phone, address, linkedin, facebook, twitter, instagram, tumblr, skype, emails, phones, current_company, current_position, avatar, resume, profile_url };
    return profile;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const pageData = (page, sort) =>
  qs.stringify({
    page: page,
    sort: sort,
    change_filters: "0",
    map_visible: "false",
    secret_xss_lite: "sKMVxtDyaQ09np02TeefAFjbj19dU6d47RfQCgS8Bj5Zjbnvjqldqxn2wbxxFphB",
    secret_xss: "sKMVxtDyaQ09np02TeefAFjbj19dU6d47RfQCgS8Bj5Zjbnvjqldqxn2wbxxFphB",
    request_id: "2e4e1f99570e6fca1d990115d2cc714a",
    annuaire_mode: "default",
    annuaire_type: "annuaire",
    active_zone_geo: "0",
  });

const pageConfig = (page, sort) => ({
  method: "post",
  maxBodyLength: Infinity,
  url: pageURL,
  headers: {
    Cookie: cookie,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  data: pageData(page, sort),
});

const fetchPageData = async (page, sort) => {
  try {
    const response = await axios.request(pageConfig(page, sort));
    const htmlData = response.data;
    const $ = cheerio.load(htmlData);

    const items = [];
    $(".single_libel").each((index, element) => {
      const href = $(element).find("a").attr("href");
      items.push(profileURL(href));
    });

    return items;
  } catch (error) {
    console.log(error);
    return [];
  }
};

module.exports = { fetchPageData, fetchProfileData };
