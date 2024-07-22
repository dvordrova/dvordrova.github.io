let n = 1;
let boxesProbabilities = [];
let numbersDivs = [];
let inBoxesDiv = [];

let won = false;

function setDesctiption(n) {
  let desciption = `
    You have ${n} box${n > 1 ? "es, and one of them" : " which"} contains the cat.
    Each click on a box triggers the cat to move left or right.
  `;

  let descriptionBox = document.getElementById("description");
  descriptionBox.innerHTML = desciption;
}

let nextLevelButton = document.getElementById("next-level");
nextLevelButton.onclick = nextLevel;

function nextLevel() {
  initPage(n + 1);
}

function initPage(newN) {
  setDesctiption(newN);
  n = newN;
  won = false;

  let slider = document.getElementById("slider");
  slider.value = n;

  let modalWin = document.getElementById("modal-win");
  modalWin.classList.add("hidden");

  let boxesDiv = document.getElementById("boxes");
  console.log(boxesProbabilities);
  boxesDiv.innerHTML = "";
  boxesProbabilities = [];
  numbersDivs = [];
  inBoxesDiv = [];
  for (let i = 0; i < n; i++) {
    boxesProbabilities.push(1 / n);
    let box = document.createElement("div");
    box.className = "box";
    box.onclick = () => clickTheBox(i);
    console.log(box);
    boxesDiv.appendChild(box);

    let number = document.createElement("div");
    number.className = "number";
    number.innerHTML = boxesProbabilities[i].toFixed(2).toString();
    numbersDivs.push(number);
    box.appendChild(number);

    let inBox = document.createElement("div");
    inBox.className = "in-box";
    inBox.style.height = `${boxesProbabilities[i] * 100}%`;
    inBoxesDiv.push(inBox);
    box.appendChild(inBox);
  }
}

function redrawBoxes() {
  console.log(numbersDivs);
  console.log(inBoxesDiv);
  for (let i = 0; i < n; ++i) {
    numbersDivs[i].innerHTML = boxesProbabilities[i].toFixed(2).toString();
    inBoxesDiv[i].style.height = `${boxesProbabilities[i] * 100}%`;
  }
}

initPage(n);

let slider = document.getElementById("slider");
slider.oninput = function () {
  let newN = slider.value;
  if (newN != n) {
    initPage(newN);
  }
};

function clickTheBox(i) {
  if (won) {
    return;
  }
  let newBoxesProbabilities = [];
  for (let j = 0; j < n; j++) {
    newBoxesProbabilities.push(0);
  }

  for (let j = 0; j < n; j++) {
    let leftIsPossible = j > 0 && i != j - 1;
    let rightIsPossible = j < n - 1 && i != j + 1;
    if (leftIsPossible && rightIsPossible) {
      newBoxesProbabilities[j - 1] += boxesProbabilities[j] / 2;
      newBoxesProbabilities[j + 1] += boxesProbabilities[j] / 2;
    } else if (leftIsPossible) {
      newBoxesProbabilities[j - 1] += boxesProbabilities[j];
    } else if (rightIsPossible) {
      newBoxesProbabilities[j + 1] += boxesProbabilities[j];
    }
  }

  newBoxesProbabilities[i] = 0;
  let sum = 0;
  for (let j = 0; j < n; j++) {
    sum += newBoxesProbabilities[j];
  }
  if (sum === 0) {
    let modalWin = document.getElementById("modal-win");
    modalWin.classList.remove("hidden");
    won = true;
  } else {
    for (let j = 0; j < n; j++) {
      newBoxesProbabilities[j] /= sum;
    }
  }

  boxesProbabilities = newBoxesProbabilities;

  redrawBoxes();
}
