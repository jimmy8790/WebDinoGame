const emoticons = ["ad1.png", "ad2.png", "ad3.png", "ad4.png", "ad5.png"];

const todayEmoticon
= emoticons[Math.floor(Math.random() * emoticons.length)];

const etImg = document.createElement("img");
etImg.src = `src/${todayEmoticon}`;

const homePage = document.querySelector(".ad");
homePage.appendChild(etImg);