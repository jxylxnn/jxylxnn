const { getTrack, PROFILE_URL } = require("../lib/player");

module.exports = async function handler(_request, response) {
  let destination = PROFILE_URL;

  try {
    const track = await getTrack();
    if (track.url) destination = track.url;
  } catch (error) {
    console.error(error);
  }

  response.setHeader("Cache-Control", "no-store");
  response.redirect(302, destination);
};
