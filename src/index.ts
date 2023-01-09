import "./styles/styles.css"; //required to load TailindCSS

document.body.classList.add("bg-stone-800", "text-slate-200");

const installedULheader = document.createElement("h1");
installedULheader.innerText = "The following are installed and ready to go:";
const installedUL = document.createElement("ul");
const installedULmessages = [
  "Webpack",
  "ES-Lint",
  "Typescript",
  "TailwindCSS",
  "Babel",
  "Jest",
];

for (const message of installedULmessages) {
  const messageEl = document.createElement("li");
  messageEl.innerText = message;
  messageEl.classList.add("pl-4");
  installedUL.appendChild(messageEl);
}

document.body.append(installedULheader, installedUL);
