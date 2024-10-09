const mysql = require("mysql2");

const con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "force_edc",
});

async function connect() {
  return await new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.log(err.message);
        reject(false);
      }
      console.log("Connected to the database!");
      resolve(true);
    });
  });
}

async function destroy() {
  return await new Promise((resolve, reject) => {
    con.destroy((err) => {
      if (err) {
        console.log(err.message);
        reject(false);
      }
      console.log("Disonnected to the database!");
      resolve(true);
    });
  });
}

async function insertProfile(profile, page) {
  const { first_name, last_name, full_name, dob, graduation_specialization, graduation_year, email, phone, address, linkedin, facebook, twitter, instagram, tumblr, skype, emails, phones, current_company, current_position, avatar, resume, profile_url } = profile;
  return await new Promise((resolve, reject) => {
    con.query(
      `INSERT INTO profiles (
            first_name, last_name, full_name, dob, graduation_specialization, graduation_year, email, phone, address, linkedin, facebook, twitter, instagram, tumblr, skype, emails, phones, current_company, current_position, avatar, resume, profile_url, page_at, created_at
        ) 
        VALUES (
            '${first_name}', '${last_name}', '${full_name}', '${dob}', '${graduation_specialization}', '${graduation_year}', '${email}', '${phone}', '${address}', '${linkedin}', '${facebook}', '${twitter}', '${instagram}', '${tumblr}', '${skype}', '${emails.join(", ")}', '${phones.join(", ")}', '${current_company}', '${current_position}', '${avatar}', '${resume}', '${profile_url}', '${page}', '${new Date().getTime()}'
        )`,
      function (err, result) {
        if (err) {
          console.log(err.message);
          reject(err.message);
        }
        resolve(result);
      }
    );
  });
}

async function findProfile(profile_url) {
  return await new Promise((resolve, reject) => {
    con.query(`SELECT * FROM profiles WHERE profile_url = '${profile_url}'`, function (err, result) {
      if (err) {
        console.log(err.message);
        reject(err.message);
      }
      resolve(result.length);
    });
  });
}

async function getLastPage() {
  return await new Promise((resolve, reject) => {
    con.query("SELECT page_at FROM profiles ORDER BY id DESC LIMIT 1", function (err, result) {
      if (err) {
        console.log(err.message);
        reject(err.message);
      }

      if (result.length > 0) {
        resolve(result[0].page_at);
      } else {
        resolve(1);
      }
    });
  });
}

module.exports = { connect, insertProfile, findProfile, getLastPage, destroy };
