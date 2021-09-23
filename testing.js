if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

function test () {
  const x = process.env.CLIENTID;
  const y = process.env.OAUTHTOKEN;
  console.log(x, y);
}

test();
