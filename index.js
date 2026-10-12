// STEP 1: Show the right measurement section for the chosen gender

const genderSelect = document.getElementById("gender");
const maleSection = document.querySelector(".male-section");
const femaleSection = document.querySelector(".female-section");

function updateMeasurementSections() {
  const chosenGender = genderSelect.value;

  if (chosenGender === "male") {
    maleSection.hidden = false;
    femaleSection.hidden = true;
  } else if (chosenGender === "female") {
    maleSection.hidden = true;
    femaleSection.hidden = false;
  } else {
    maleSection.hidden = false;
    femaleSection.hidden = false;
  }
}

genderSelect.addEventListener("change", updateMeasurementSections);

updateMeasurementSections();


// STEP 2: Collect everything the tailor typed

const measurementForm = document.getElementById("measurementForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const unitSelect = document.getElementById("unit");
const notesInput = document.getElementById("notes");

const maleFields = [
  { id: "male-chest", label: "Chest" },
  { id: "male-waist", label: "Waist" },
  { id: "male-hip", label: "Hip" },
  { id: "male-shoulder", label: "Shoulder" },
  { id: "male-sleeve", label: "Sleeve Length" },
  { id: "male-neck", label: "Neck" },
  { id: "male-shirt", label: "Shirt Length" },
  { id: "male-trouser", label: "Trouser Length" }
];

const femaleFields = [
  { id: "female-bust", label: "Bust" },
  { id: "female-waist", label: "Waist" },
  { id: "female-hip", label: "Hip" },
  { id: "female-shoulder", label: "Shoulder" },
  { id: "female-sleeve", label: "Sleeve Length" },
  { id: "female-blouse", label: "Blouse Length" },
  { id: "female-dress", label: "Dress / Gown Length" },
  { id: "female-skirt", label: "Skirt Length" }
];

function collectMeasurements(fieldList, groupName) {
  const found = [];

  fieldList.forEach(function (field) {
    const value = document.getElementById(field.id).value;

    if (value !== "") {
      found.push({ group: groupName, label: field.label, value: value });
    }
  });

  return found;
}

function collectCustomerData() {
  let measurements = [];

  if (!maleSection.hidden) {
    measurements = measurements.concat(collectMeasurements(maleFields, "Male"));
  }

  if (!femaleSection.hidden) {
    measurements = measurements.concat(collectMeasurements(femaleFields, "Female"));
  }

  return {
    id: Date.now().toString(),
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    gender: genderSelect.value,
    unit: unitSelect.value,
    measurements: measurements,
    notes: notesInput.value.trim(),
    dateSaved: new Date().toISOString()
  };
}


// STEP 3: Save the customer in localStorage

const STORAGE_KEY = "goldenBizzCustomers";

function getSavedCustomers() {
  const savedText = localStorage.getItem(STORAGE_KEY);

  if (savedText === null) {
    return [];
  }

  return JSON.parse(savedText);
}

function saveCustomerList(customerList) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customerList));
}

function addCustomer(customer) {
  const customerList = getSavedCustomers();
  customerList.push(customer);
  saveCustomerList(customerList);
}


// STEP 4: Show the saved customers on the page

const savedList = document.getElementById("savedList");

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}


// STEP 5: Delete a customer

function deleteCustomer(customerId) {
  const customerList = getSavedCustomers();

  const remainingCustomers = customerList.filter(function (customer) {
    return customer.id !== customerId;
  });

  saveCustomerList(remainingCustomers);
  renderCustomers();
}

function buildCustomerCard(customer) {
  const card = document.createElement("div");
  card.className = "customer-card";

  const displayName = customer.name === "" ? "Unnamed customer" : customer.name;
  card.appendChild(makeElement("h3", "card-name", displayName));

  if (customer.phone !== "") {
    card.appendChild(makeElement("p", "card-phone", customer.phone));
  }

  const genderText = customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1);
  const savedDate = new Date(customer.dateSaved).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  card.appendChild(makeElement("p", "card-info", genderText + " · " + savedDate));

  const showGroup = customer.gender !== "male" && customer.gender !== "female";

  customer.measurements.forEach(function (item) {
    const prefix = showGroup ? item.group + " " : "";
    const line = prefix + item.label + ": " + item.value + " " + customer.unit;
    card.appendChild(makeElement("p", "card-detail", line));
  });

  if (customer.notes !== "") {
    card.appendChild(makeElement("p", "card-notes", customer.notes));
  }

  const cardButtons = document.createElement("div");
  cardButtons.className = "card-buttons";

  const deleteButton = makeElement("button", "card-delete-btn", "Delete");
  deleteButton.type = "button";

  deleteButton.addEventListener("click", function () {
    const sure = confirm("Delete " + displayName + "? This cannot be undone.");

    if (sure) {
      deleteCustomer(customer.id);
    }
  });

  cardButtons.appendChild(deleteButton);
  card.appendChild(cardButtons);

  return card;
}

function renderCustomers() {
  const customerList = getSavedCustomers();

  savedList.innerHTML = "";

  if (customerList.length === 0) {
    savedList.appendChild(makeElement("p", "empty-message", "No customers saved yet."));
    return;
  }

  customerList.slice().reverse().forEach(function (customer) {
    savedList.appendChild(buildCustomerCard(customer));
  });
}


function showMessage(message) {
  Swal.fire({
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 500
  });
}
// CONNECT EVERYTHING: this is the only handler for the form, keep it at the very bottom

        measurementForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const customer = collectCustomerData();
        addCustomer(customer);
        renderCustomers();
        measurementForm.reset();
        updateMeasurementSections();
        showMessage("Customer saved");
        });

        renderCustomers();