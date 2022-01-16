/* eslint-disable no-alert */
if (window.localStorage.gameState) {
  window.data = JSON.parse(localStorage.getItem("gameState"));
}

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  const coffeeCounter = document.getElementById("coffee_counter");
  coffeeCounter.innerText = coffeeQty;
}

function clickCoffee(data) {
  data.coffee++;
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  producers.forEach((prod) => {
    if (coffeeCount >= 0.5 * prod.price || prod.unlocked === true)
      prod.unlocked = true;
  });
}

function getUnlockedProducers(data) {
  return data.producers.filter((prod) => prod.unlocked);
}

function makeDisplayNameFromId(id) {
  let dispName = "";
  for (let i = 0; i < id.length; i++) {
    if (i === 0 || id[i - 1] === "_") dispName += id[i].toUpperCase();
    else if (id[i] === "_") dispName += " ";
    else dispName += id[i];
  }
  return dispName;
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement("div");
  containerDiv.className = "producer";
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" id="buy_${producer.id}">Buy</button>
    <button class="sell-producer" id="sell${producer.id}">Sell</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function renderProducers(data) {
  const producerContainer = document.getElementById("producer_container");
  deleteAllChildNodes(producerContainer);
  unlockProducers(data.producers, data.coffee);
  const unlockedProds = getUnlockedProducers(data);
  unlockedProds.forEach((prod) => {
    producerContainer.appendChild(makeProducerDiv(prod));
  });
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  for (let producer of data.producers) {
    if (producer.id === producerId) return producer;
  }
}

function canAffordProducer(data, producerId) {
  return data.coffee >= getProducerById(data, producerId).price;
}

function updateCPSView(cps) {
  const cpsView = document.getElementById("cps");
  cpsView.innerText = cps;
}

function updatePrice(oldPrice) {
  return Math.floor(1.25 * oldPrice);
}

function attemptToBuyProducer(data, producerId) {
  const producer = getProducerById(data, producerId);
  if (canAffordProducer(data, producerId)) {
    producer.qty++;
    data.coffee -= producer.price;
    producer.price = updatePrice(producer.price);
    data.totalCPS += producer.cps;
    return true;
  }
  return false;
}

function buyButtonClick(event, data) {
  if (
    event.target.tagName === "BUTTON" &&
    event.target.className != "sell-producer"
  ) {
    const producerId = event.target.id.slice(4);
    if (attemptToBuyProducer(data, producerId)) {
      renderProducers(data);
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);
    } else window.alert("Not enough coffee!");
  }
}

function sellProducer(data, producerId) {
  const producer = getProducerById(data, producerId);
  if (producer.qty >= 1) {
    producer.qty--;
    data.coffee += Math.floor(0.75 * producer.price);
    data.totalCPS -= producer.cps;
    renderProducers(data);
    updateCoffeeView(data.coffee);
    updateCPSView(data.totalCPS);
  } else
    window.alert(
      `You don't have any ${makeDisplayNameFromId(producer.id)}s to sell!`
    );
}

function sellButtonClick(event, data) {
  if (event.target.className === "sell-producer") {
    const producerId = event.target.id.slice(4);
    sellProducer(data, producerId);
    console.log(event.target.className);
  }
}

function tick(data) {
  data.coffee += data.totalCPS;
  updateCoffeeView(data.coffee);
  renderProducers(data);
  updateCPSView(data.totalCPS);
}

const saveButton = document.getElementById("save-game");
saveButton.addEventListener("click", function () {
  localStorage.setItem("gameState", JSON.stringify(window.data));
  window.alert(
    "Your game is saved! If you leave and come back, you'll be back where you left off!"
  );
});

const clearGameDataButton = document.getElementById("clear-game-data");
clearGameDataButton.addEventListener("click", function () {
  localStorage.clear();
  window.alert(
    "Your data has been cleared! If you leave and come back, the game will be reset!"
  );
});

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === "undefined") {
  // Get starting data from the window object
  // (This comes from data.js)
  const data = window.data;

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById("big_coffee");
  bigCoffee.addEventListener("click", () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById("producer_container");
  producerContainer.addEventListener("click", (event) => {
    buyButtonClick(event, data);
    sellButtonClick(event, data);
  });

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick,
  };
}
