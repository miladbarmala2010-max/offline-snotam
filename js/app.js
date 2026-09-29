// =========================================================
// OFFLINE SNOTAM - APPLICATION LOGIC
// =========================================================


// =========================================================
// DATE & TIME
// =========================================================

// Get today's date in YYYY-MM-DD format
function getTodayDate() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Get current time in HH:MM format
function getCurrentTime() {

    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}


// Set automatic observation date and time
function setObservationDateTime() {

    document.getElementById("observation-date").value =
        getTodayDate();

    document.getElementById("observation-time").value =
        getCurrentTime();
}


// Initialize date and time
setObservationDateTime();



// =========================================================
// RUNWAY SURFACE CONDITION OPTIONS
// =========================================================

// All available runway surface conditions
const surfaceConditions = [

    "Compacted Snow",
    "Dry Snow",
    "Dry Snow On Top Of Compacted Snow",
    "Dry Snow On Top Of Ice",
    "Frost",
    "Ice",
    "Slush",
    "Standing water",
    "Water On Top Of Compacted Snow",
    "Sluppery Wet",
    "Wet (Damp)",
    "Wet Ice",
    "Wet Snow",
    "Wet Snow On Top Of Compacted Snow",
    "Wet Snow On Top Of Ice",
    "Dry"

];


// Fill the condition dropdowns
function loadSurfaceConditions() {

    const dropdowns = [

        document.getElementById(
            "surface-description-first"
        ),

        document.getElementById(
            "surface-description-second"
        ),

        document.getElementById(
            "surface-description-third"
        )

    ];


    dropdowns.forEach((dropdown) => {

        surfaceConditions.forEach((condition) => {

            const option =
                document.createElement("option");

            option.value = condition;
            option.textContent = condition;

            dropdown.appendChild(option);

        });

    });

}


// Load conditions
loadSurfaceConditions();



// =========================================================
// RUNWAY THIRD COVERAGE LOGIC
// =========================================================

function setupThirdCoverage(thirdName) {

    const coverageRadios =
        document.querySelectorAll(
            `input[name="coverage-${thirdName}"]`
        );

    const surfaceCondition =
        document.getElementById(
            `surface-condition-${thirdName}`
        );

    const coveragePercentage =
        document.getElementById(
            `coverage-percentage-${thirdName}`
        );


    coverageRadios.forEach((radio) => {

        radio.addEventListener("change", function () {

            // Show condition for 10-25% and >25%
            if (
                this.value === "10to25" ||
                this.value === "greater25"
            ) {

                surfaceCondition.hidden = false;

            } else {

                surfaceCondition.hidden = true;

                // Clear selected condition
                document.getElementById(
                    `surface-description-${thirdName}`
                ).value = "";

                // Hide Depth
                document.getElementById(
                    `depth-field-${thirdName}`
                ).classList.remove("show-depth");

                // Clear Depth
                document.getElementById(
                    `depth-${thirdName}`
                ).value = "";
            }


            // Show 50 / 75 / 100% only for >25%
            if (this.value === "greater25") {

                coveragePercentage.hidden = false;

            } else {

                coveragePercentage.hidden = true;

                // Clear coverage percentage
                const percentageRadios =
                    document.querySelectorAll(
                        `input[name="coverage-percent-${thirdName}"]`
                    );

                percentageRadios.forEach((item) => {
                    item.checked = false;
                });
            }


            // Recalculate RWYCC
            calculateRWYCC(thirdName);

        });

    });

}



// =========================================================
// DEPTH FIELD LOGIC
// =========================================================

// Only these four conditions require Depth
const depthRequiredConditions = [

    "Dry Snow",
    "Slush",
    "Standing water",
    "Wet Snow"

];


function setupDepthLogic(thirdName) {

    const surfaceDescription =
        document.getElementById(
            `surface-description-${thirdName}`
        );

    const depthField =
        document.getElementById(
            `depth-field-${thirdName}`
        );

    const depthInput =
        document.getElementById(
            `depth-${thirdName}`
        );


    surfaceDescription.addEventListener(
        "change",
        function () {

            const selectedCondition = this.value;


            // Show Depth only for the four conditions
            if (
                depthRequiredConditions.includes(
                    selectedCondition
                )
            ) {

                depthField.classList.add(
                    "show-depth"
                );

            } else {

                // Hide Depth for all other conditions
                depthField.classList.remove(
                    "show-depth"
                );

                // Clear old Depth
                depthInput.value = "";

            }


            // Recalculate RWYCC
            calculateRWYCC(thirdName);

        }
    );


    // Recalculate when Depth changes
    depthInput.addEventListener(
        "input",
        function () {

            calculateRWYCC(thirdName);

        }
    );

}



// =========================================================
// RWYCC CALCULATION
// =========================================================

function calculateRWYCC(thirdName) {

    const rwyccOutput =
        document.getElementById(
            `rwycc-${thirdName}`
        );


    // -----------------------------------------------------
    // Get selected coverage
    // -----------------------------------------------------

    const selectedCoverage =
        document.querySelector(
            `input[name="coverage-${thirdName}"]:checked`
        );


    // No coverage selected
    if (!selectedCoverage) {

        rwyccOutput.textContent = "—";

        syncAdjustedRWYCC();

        return;
    }


    // -----------------------------------------------------
    // Less than 10% OR 10-25%
    // -----------------------------------------------------
    // Both conditions produce RWYCC 6
    // -----------------------------------------------------

    if (
        selectedCoverage.value === "less10" ||
        selectedCoverage.value === "10to25"
    ) {

        rwyccOutput.textContent = "6";

        syncAdjustedRWYCC();

        return;
    }


    // -----------------------------------------------------
    // Greater than 25%
    // -----------------------------------------------------

    if (selectedCoverage.value !== "greater25") {

        rwyccOutput.textContent = "—";

        syncAdjustedRWYCC();

        return;
    }


    // -----------------------------------------------------
    // Get selected surface condition
    // -----------------------------------------------------

    const surfaceDescription =
        document.getElementById(
            `surface-description-${thirdName}`
        );

    const condition =
        surfaceDescription.value;


    // No condition selected yet
    if (!condition) {

        rwyccOutput.textContent = "—";

        syncAdjustedRWYCC();

        return;
    }


    // -----------------------------------------------------
    // Get outside air temperature
    // -----------------------------------------------------

    const temperatureInput =
        document.getElementById(
            "outside-temperature"
        );

    const temperature =
        parseFloat(temperatureInput.value);


    // -----------------------------------------------------
    // Get Depth
    // -----------------------------------------------------

    const depthInput =
        document.getElementById(
            `depth-${thirdName}`
        );

    const depth =
        parseFloat(depthInput.value);


    // -----------------------------------------------------
    // Calculate according to surface condition
    // -----------------------------------------------------

    let rwycc = null;


    switch (condition) {


        // -------------------------------------------------
        // Compacted Snow
        // -------------------------------------------------

        case "Compacted Snow":

            // Temperature is required
            if (isNaN(temperature)) {

                rwyccOutput.textContent = "—";

                syncAdjustedRWYCC();

                return;
            }

            if (temperature <= -15) {

                rwycc = 3;

            } else {

                rwycc = 4;

            }

            break;


        // -------------------------------------------------
        // Dry Snow
        // -------------------------------------------------

        case "Dry Snow":

            // Depth is required
            if (isNaN(depth)) {

                rwyccOutput.textContent = "—";

                syncAdjustedRWYCC();

                return;
            }

            if (depth <= 3) {

                rwycc = 5;

            } else {

                rwycc = 3;

            }

            break;


        // -------------------------------------------------
        // Dry Snow On Top Of Compacted Snow
        // -------------------------------------------------

        case "Dry Snow On Top Of Compacted Snow":

            rwycc = 3;

            break;


        // -------------------------------------------------
        // Dry Snow On Top Of Ice
        // -------------------------------------------------

        case "Dry Snow On Top Of Ice":

            rwycc = 0;

            break;


        // -------------------------------------------------
        // Frost
        // -------------------------------------------------

        case "Frost":

            rwycc = 5;

            break;


        // -------------------------------------------------
        // Ice
        // -------------------------------------------------

        case "Ice":

            rwycc = 1;

            break;


        // -------------------------------------------------
        // Slush
        // -------------------------------------------------

        case "Slush":

            // Depth is required
            if (isNaN(depth)) {

                rwyccOutput.textContent = "—";

                syncAdjustedRWYCC();

                return;
            }

            if (depth <= 3) {

                rwycc = 5;

            } else {

                rwycc = 2;

            }

            break;


        // -------------------------------------------------
        // Standing water
        // -------------------------------------------------

        case "Standing water":

            // Depth is required
            if (isNaN(depth)) {

                rwyccOutput.textContent = "—";

                syncAdjustedRWYCC();

                return;
            }

            // Less than 4 mm = 5
            // 4 mm or more = 2
            if (depth < 4) {

                rwycc = 5;

            } else {

                rwycc = 2;

            }

            break;


        // -------------------------------------------------
        // Water On Top Of Compacted Snow
        // -------------------------------------------------

        case "Water On Top Of Compacted Snow":

            rwycc = 0;

            break;


        // -------------------------------------------------
        // Sluppery Wet
        // -------------------------------------------------

        case "Sluppery Wet":

            rwycc = 3;

            break;


        // -------------------------------------------------
        // Wet (Damp)
        // -------------------------------------------------

        case "Wet (Damp)":

            rwycc = 5;

            break;


        // -------------------------------------------------
        // Wet Ice
        // -------------------------------------------------

        case "Wet Ice":

            rwycc = 0;

            break;


        // -------------------------------------------------
        // Wet Snow
        // -------------------------------------------------

        case "Wet Snow":

            // Depth is required
            if (isNaN(depth)) {

                rwyccOutput.textContent = "—";

                syncAdjustedRWYCC();

                return;
            }

            if (depth <= 3) {

                rwycc = 5;

            } else {

                rwycc = 3;

            }

            break;


        // -------------------------------------------------
        // Wet Snow On Top Of Compacted Snow
        // -------------------------------------------------

        case "Wet Snow On Top Of Compacted Snow":

            rwycc = 3;

            break;


        // -------------------------------------------------
        // Wet Snow On Top Of Ice
        // -------------------------------------------------

        case "Wet Snow On Top Of Ice":

            rwycc = 0;

            break;


        // -------------------------------------------------
        // Dry
        // -------------------------------------------------

        case "Dry":

            rwycc = 6;

            break;


        // Unknown condition
        default:

            rwyccOutput.textContent = "—";

            syncAdjustedRWYCC();

            return;
    }


    // Show calculated RWYCC
    rwyccOutput.textContent = rwycc;

    // Keep Adjusted RWYCC synchronized while AD adjustment is OFF
    syncAdjustedRWYCC();

}



// =========================================================
// SETUP ALL THREE RUNWAY THIRDS
// =========================================================

setupThirdCoverage("first");
setupThirdCoverage("second");
setupThirdCoverage("third");

setupDepthLogic("first");
setupDepthLogic("second");
setupDepthLogic("third");



// =========================================================
// TEMPERATURE CHANGE
// =========================================================

// Temperature affects Compacted Snow
const temperatureInput =
    document.getElementById(
        "outside-temperature"
    );

temperatureInput.addEventListener(
    "input",
    function () {

        // Recalculate all three thirds
        calculateRWYCC("first");
        calculateRWYCC("second");
        calculateRWYCC("third");

    }
);



// =========================================================
// ADJUSTED RWYCC LOGIC
// =========================================================

const adjustedToggle =
    document.getElementById(
        "adjusted-rwycc-toggle"
    );

const adjustedFields =
    document.getElementById(
        "adjusted-rwycc-fields"
    );

const rwyccFirst =
    document.getElementById(
        "rwycc-first"
    );

const rwyccSecond =
    document.getElementById(
        "rwycc-second"
    );

const rwyccThird =
    document.getElementById(
        "rwycc-third"
    );

const adjustedFirst =
    document.getElementById(
        "adjusted-rwycc-first"
    );

const adjustedSecond =
    document.getElementById(
        "adjusted-rwycc-second"
    );

const adjustedThird =
    document.getElementById(
        "adjusted-rwycc-third"
    );


// ---------------------------------------------------------
// Copy calculated RWYCC values to Adjusted RWYCC
// ---------------------------------------------------------

function copyRWYCCToAdjusted() {

    adjustedFirst.value =
        rwyccFirst.textContent !== "—"
            ? rwyccFirst.textContent
            : "";

    adjustedSecond.value =
        rwyccSecond.textContent !== "—"
            ? rwyccSecond.textContent
            : "";

    adjustedThird.value =
        rwyccThird.textContent !== "—"
            ? rwyccThird.textContent
            : "";
}


// ---------------------------------------------------------
// Synchronize only when AD adjustment is OFF
// ---------------------------------------------------------

function syncAdjustedRWYCC() {

    if (!adjustedToggle.checked) {

        copyRWYCCToAdjusted();

    }

}


// ---------------------------------------------------------
// Lock / unlock Adjusted RWYCC fields
// ---------------------------------------------------------

function setAdjustedFieldsLocked(locked) {

    adjustedFirst.disabled = locked;
    adjustedSecond.disabled = locked;
    adjustedThird.disabled = locked;
}


// ---------------------------------------------------------
// Handle AD decision checkbox
// ---------------------------------------------------------

adjustedToggle.addEventListener(
    "change",
    function () {

        if (this.checked) {

            // Copy latest calculated values
            copyRWYCCToAdjusted();

            // Allow manual adjustment
            setAdjustedFieldsLocked(false);

            // Show adjusted fields
            adjustedFields.hidden = false;

        } else {

            // Return to calculated values
            copyRWYCCToAdjusted();

            // Lock the fields
            setAdjustedFieldsLocked(true);

            // Hide adjusted fields
            adjustedFields.hidden = true;

        }

    }
);



// =========================================================
// BOX J / K / L / O
// =========================================================

// These boxes only need a selected/unselected state.
// Their values will be used later by the AFTN generator.

const simpleCheckboxes = [

    "drifting-snow",
    "loose-sand",
    "chemical-treatment",
    "snowbanks-adjacent"

];


simpleCheckboxes.forEach((id) => {

    const checkbox =
        document.getElementById(id);

    checkbox.addEventListener(
        "change",
        function () {

            // State is kept for later AFTN generation.

        }
    );

});



// =========================================================
// BOX M - SNOWBANKS ON RUNWAY
// =========================================================

const snowbanksRunwayToggle =
    document.getElementById(
        "snowbanks-runway-toggle"
    );

const snowbanksRunwayFields =
    document.getElementById(
        "snowbanks-runway-fields"
    );


// Create one runway snowbank row
function addSnowbanksRunwayRow() {

    const row =
        document.createElement("div");

    row.className =
        "dynamic-row";


    row.innerHTML = `

        <span class="row-number">
            1 :
        </span>

        <input
            type="text"
            class="snowbank-rwy-name"
            placeholder="Enter RWY Name"
        >

        <select class="snowbank-rwy-side">
            <option value="">L / R / LR</option>
            <option value="L">L</option>
            <option value="R">R</option>
            <option value="LR">LR</option>
        </select>

        <input
            type="number"
            class="snowbank-rwy-distance"
            min="0"
            step="1"
            placeholder="Distance (m)"
        >

        <select class="snowbank-rwy-position">
            <option value="">L / R / LR</option>
            <option value="L">L</option>
            <option value="R">R</option>
            <option value="LR">LR</option>
        </select>

        <button
            type="button"
            class="row-button remove"
            title="Remove row"
        >
            −
        </button>

        <button
            type="button"
            class="row-button add"
            title="Add row"
        >
            +
        </button>

    `;


    // Remove this row
    row.querySelector(".remove")
        .addEventListener(
            "click",
            function () {

                row.remove();

                renumberRows(
                    snowbanksRunwayFields,
                    "row-number"
                );

            }
        );


    // Add another row
    row.querySelector(".add")
        .addEventListener(
            "click",
            function () {

                addSnowbanksRunwayRow();

                renumberRows(
                    snowbanksRunwayFields,
                    "row-number"
                );

            }
        );


    snowbanksRunwayFields.appendChild(row);

    // Keep numbering correct
    renumberRows(
        snowbanksRunwayFields,
        "row-number"
    );

}


// Show / hide runway snowbank fields
snowbanksRunwayToggle.addEventListener(
    "change",
    function () {

        if (this.checked) {

            snowbanksRunwayFields.hidden = false;

            // Create first row
            if (
                snowbanksRunwayFields
                    .querySelectorAll(".dynamic-row")
                    .length === 0
            ) {

                addSnowbanksRunwayRow();

            }

        } else {

            snowbanksRunwayFields.hidden = true;

        }

    }
);



// =========================================================
// BOX N - SNOWBANKS ON TAXIWAY
// =========================================================

const snowbanksTaxiwayToggle =
    document.getElementById(
        "snowbanks-taxiway-toggle"
    );

const snowbanksTaxiwayFields =
    document.getElementById(
        "snowbanks-taxiway-fields"
    );


// Create one taxiway snowbank row
function addSnowbanksTaxiwayRow() {

    const row =
        document.createElement("div");

    row.className =
        "dynamic-row twy-row";


    row.innerHTML = `

        <span class="row-number">
            1 :
        </span>

        <input
            type="text"
            class="snowbank-twy-name"
            placeholder="Enter TWY Name"
        >

        <button
            type="button"
            class="row-button remove"
            title="Remove row"
        >
            −
        </button>

        <button
            type="button"
            class="row-button add"
            title="Add row"
        >
            +
        </button>

    `;


    // Remove this row
    row.querySelector(".remove")
        .addEventListener(
            "click",
            function () {

                row.remove();

                renumberRows(
                    snowbanksTaxiwayFields,
                    "row-number"
                );

            }
        );


    // Add another row
    row.querySelector(".add")
        .addEventListener(
            "click",
            function () {

                addSnowbanksTaxiwayRow();

                renumberRows(
                    snowbanksTaxiwayFields,
                    "row-number"
                );

            }
        );


    snowbanksTaxiwayFields.appendChild(row);

    // Keep numbering correct
    renumberRows(
        snowbanksTaxiwayFields,
        "row-number"
    );

}


// Show / hide taxiway snowbank fields
snowbanksTaxiwayToggle.addEventListener(
    "change",
    function () {

        if (this.checked) {

            snowbanksTaxiwayFields.hidden = false;

            // Create first row
            if (
                snowbanksTaxiwayFields
                    .querySelectorAll(".dynamic-row")
                    .length === 0
            ) {

                addSnowbanksTaxiwayRow();

            }

        } else {

            snowbanksTaxiwayFields.hidden = true;

        }

    }
);



// =========================================================
// BOX P - TAXIWAY CONDITIONS
// =========================================================

const taxiwayConditionRadios =
    document.querySelectorAll(
        'input[name="taxiway-condition"]'
    );

const taxiwayConditionFields =
    document.getElementById(
        "taxiway-condition-fields"
    );


// Create one taxiway condition row
function addTaxiwayConditionRow() {

    const row =
        document.createElement("div");

    row.className =
        "dynamic-row twy-row";


    row.innerHTML = `

        <span class="row-number">
            1 :
        </span>

        <input
            type="text"
            class="taxiway-condition-name"
            placeholder="Enter TWY Name"
        >

        <button
            type="button"
            class="row-button remove"
            title="Remove row"
        >
            −
        </button>

        <button
            type="button"
            class="row-button add"
            title="Add row"
        >
            +
        </button>

    `;


    // Remove this row
    row.querySelector(".remove")
        .addEventListener(
            "click",
            function () {

                row.remove();

                renumberRows(
                    taxiwayConditionFields,
                    "row-number"
                );

            }
        );


    // Add another row
    row.querySelector(".add")
        .addEventListener(
            "click",
            function () {

                addTaxiwayConditionRow();

                renumberRows(
                    taxiwayConditionFields,
                    "row-number"
                );

            }
        );


    taxiwayConditionFields.appendChild(row);

    // Keep numbering correct
    renumberRows(
        taxiwayConditionFields,
        "row-number"
    );

}


// Handle taxiway condition selection
taxiwayConditionRadios.forEach((radio) => {

    radio.addEventListener(
        "change",
        function () {

            if (this.value === "specific") {

                taxiwayConditionFields.hidden = false;

                // Create first row
                if (
                    taxiwayConditionFields
                        .querySelectorAll(".dynamic-row")
                        .length === 0
                ) {

                    addTaxiwayConditionRow();

                }

            } else {

                taxiwayConditionFields.hidden = true;

            }

        }
    );

});



// =========================================================
// BOX R - APRON CONDITIONS
// =========================================================

const apronConditionRadios =
    document.querySelectorAll(
        'input[name="apron-condition"]'
    );

const apronConditionFields =
    document.getElementById(
        "apron-condition-fields"
    );


// Create one apron condition row
function addApronConditionRow() {

    const row =
        document.createElement("div");

    row.className =
        "dynamic-row apron-row";


    row.innerHTML = `

        <span class="row-number">
            1 :
        </span>

        <input
            type="text"
            class="apron-condition-name"
            placeholder="Enter APRON Name"
        >

        <button
            type="button"
            class="row-button remove"
            title="Remove row"
        >
            −
        </button>

        <button
            type="button"
            class="row-button add"
            title="Add row"
        >
            +
        </button>

    `;


    // Remove this row
    row.querySelector(".remove")
        .addEventListener(
            "click",
            function () {

                row.remove();

                renumberRows(
                    apronConditionFields,
                    "row-number"
                );

            }
        );


    // Add another row
    row.querySelector(".add")
        .addEventListener(
            "click",
            function () {

                addApronConditionRow();

                renumberRows(
                    apronConditionFields,
                    "row-number"
                );

            }
        );


    apronConditionFields.appendChild(row);

    // Keep numbering correct
    renumberRows(
        apronConditionFields,
        "row-number"
    );

}


// Handle apron condition selection
apronConditionRadios.forEach((radio) => {

    radio.addEventListener(
        "change",
        function () {

            if (this.value === "specific") {

                apronConditionFields.hidden = false;

                // Create first row
                if (
                    apronConditionFields
                        .querySelectorAll(".dynamic-row")
                        .length === 0
                ) {

                    addApronConditionRow();

                }

            } else {

                apronConditionFields.hidden = true;

            }

        }
    );

});



// =========================================================
// BOX REDUCED RUNWAY LENGTH
// =========================================================

const reducedRwyLengthToggle =
    document.getElementById(
        "reduced-rwy-length-toggle"
    );

const reducedRwyLengthFields =
    document.getElementById(
        "reduced-rwy-length-fields"
    );


// Create one reduced runway length row
function addReducedRwyLengthRow() {

    const row =
        document.createElement("div");

    row.className =
        "dynamic-row reduced-rwy-row";


    row.innerHTML = `

        <span class="row-number">
            1 :
        </span>

        <input
            type="text"
            class="reduced-rwy-name"
            placeholder="Enter RWY Name"
        >

        <select class="reduced-rwy-side">
            <option value="">R / L / C</option>
            <option value="R">R</option>
            <option value="L">L</option>
            <option value="C">C</option>
        </select>

        <input
            type="number"
            class="reduced-rwy-value"
            min="0"
            step="1"
            placeholder="Reduced To (m)"
        >

        <button
            type="button"
            class="row-button remove"
            title="Remove row"
        >
            −
        </button>

        <button
            type="button"
            class="row-button add"
            title="Add row"
        >
            +
        </button>

    `;


    // Remove this row
    row.querySelector(".remove")
        .addEventListener(
            "click",
            function () {

                row.remove();

                renumberRows(
                    reducedRwyLengthFields,
                    "row-number"
                );

            }
        );


    // Add another row
    row.querySelector(".add")
        .addEventListener(
            "click",
            function () {

                addReducedRwyLengthRow();

                renumberRows(
                    reducedRwyLengthFields,
                    "row-number"
                );

            }
        );


    reducedRwyLengthFields.appendChild(row);

    // Keep numbering correct
    renumberRows(
        reducedRwyLengthFields,
        "row-number"
    );

}


// Show / hide reduced runway length fields
reducedRwyLengthToggle.addEventListener(
    "change",
    function () {

        if (this.checked) {

            reducedRwyLengthFields.hidden = false;

            // Create first row
            if (
                reducedRwyLengthFields
                    .querySelectorAll(".dynamic-row")
                    .length === 0
            ) {

                addReducedRwyLengthRow();

            }

        } else {

            reducedRwyLengthFields.hidden = true;

        }

    }
);



// =========================================================
// DYNAMIC ROW HELPERS
// =========================================================

// Renumber all rows after adding/removing
function renumberRows(
    container,
    className
) {

    const rows =
        container.querySelectorAll(
            `.${className}`
        );


    rows.forEach(
        (number, index) => {

            number.textContent =
                `${index + 1} :`;

        }
    );

}
// =========================================================
// AFTN / SNOWTAM MESSAGE GENERATOR
// =========================================================

// Airport display name -> ICAO code
const snowtamAirportCodes = {
    URMIA: "OITR",
    KHOY: "OITK"
};


// ---------------------------------------------------------
// Create the message output area dynamically
// ---------------------------------------------------------

function createMessageGeneratorUI() {

    // Do not create it twice
    if (document.getElementById("aftn-generator-box")) {
        return;
    }

    const remarksBox =
        document.getElementById("plain-language-remarks")
            ?.closest(".notam-box");

    if (!remarksBox) {
        return;
    }

    const generatorBox =
        document.createElement("div");

    generatorBox.id =
        "aftn-generator-box";

    generatorBox.className =
        "aftn-generator-box";

    generatorBox.innerHTML = `

        <h3>GENERATED AFTN MESSAGE</h3>

        <textarea
            id="generated-aftn-message"
            class="generated-aftn-message"
            readonly
            placeholder="Generated SNOWTAM message will appear here..."
        ></textarea>

        <div class="aftn-actions">

            <button
                type="button"
                id="generate-aftn-button"
                class="aftn-button primary"
            >
                GENERATE AFTN MESSAGE
            </button>

            <button
                type="button"
                id="copy-aftn-button"
                class="aftn-button"
            >
                COPY MESSAGE
            </button>

            <button
                type="button"
                id="new-snotam-button"
                class="aftn-button reset"
            >
                NEW SNOTAM
            </button>

        </div>

        <div
            id="aftn-message-status"
            class="aftn-message-status"
        ></div>

    `;

    remarksBox.insertAdjacentElement(
        "afterend",
        generatorBox
    );


    // Connect buttons
    document
        .getElementById("generate-aftn-button")
        .addEventListener(
            "click",
            generateAFTNMessage
        );


    document
        .getElementById("copy-aftn-button")
        .addEventListener(
            "click",
            copyAFTNMessage
        );


    document
        .getElementById("new-snotam-button")
        .addEventListener(
            "click",
            resetSNOTAMForm
        );
}


// =========================================================
// MESSAGE HELPER FUNCTIONS
// =========================================================


// Get selected radio value
function getSelectedRadioValue(name) {

    const selected =
        document.querySelector(
            `input[name="${name}"]:checked`
        );

    return selected
        ? selected.value
        : "";
}


// Get clean input value
function getInputValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


// Convert date + time to YYMMDDHHmm
function getSNOWTAMDateTime() {

    const date =
        getInputValue("observation-date");

    const time =
        getInputValue("observation-time");


    if (!date || !time) {
        return "";
    }


    const dateParts =
        date.split("-");

    const timeParts =
        time.split(":");


    if (
        dateParts.length !== 3 ||
        timeParts.length < 2
    ) {
        return "";
    }


    const year =
        dateParts[0].slice(-2);

    const month =
        dateParts[1];

    const day =
        dateParts[2];

    const hour =
        timeParts[0];

    const minute =
        timeParts[1];


    return (
        year +
        month +
        day +
        hour +
        minute
    );
}


// =========================================================
// COVERAGE
// =========================================================

// Convert coverage selection to SNOWTAM value
function getSnowtamCoverage(thirdName) {

    const coverage =
        getSelectedRadioValue(
            `coverage-${thirdName}`
        );


    // Less than 10%
    if (coverage === "less10") {
        return "NR";
    }


    // 10% to 25%
    if (coverage === "10to25") {
        return "NR";
    }


    // More than 25%
    if (coverage === "greater25") {

        const percentage =
            getSelectedRadioValue(
                `coverage-percent-${thirdName}`
            );


        if (
            percentage === "50" ||
            percentage === "75" ||
            percentage === "100"
        ) {
            return percentage;
        }

        return "NR";
    }


    // No coverage selected
    return "NR";
}


// =========================================================
// DEPTH
// =========================================================

// Get runway depth or NR
function getSnowtamDepth(thirdName) {

    const depth =
        getInputValue(
            `depth-${thirdName}`
        );


    if (!depth) {
        return "NR";
    }


    return depth;
}


// =========================================================
// SURFACE CONDITION
// =========================================================

// Get runway surface condition or NR
function getSnowtamCondition(thirdName) {

    const condition =
        getInputValue(
            `surface-description-${thirdName}`
        );


    if (!condition) {
        return "NR";
    }


    return condition;
}


// =========================================================
// RWYCC
// =========================================================

// Get final RWYCC for a runway third
function getFinalRWYCC(
    thirdName,
    adjustedId,
    calculatedId
) {

    const adjusted =
        document.getElementById(
            adjustedId
        );

    const calculated =
        document.getElementById(
            calculatedId
        );


    // Use adjusted RWYCC when AD decision is enabled
    if (
        adjustedToggle &&
        adjustedToggle.checked &&
        adjusted &&
        adjusted.value !== ""
    ) {
        return adjusted.value;
    }


    // Otherwise use calculated RWYCC
    if (
        calculated &&
        calculated.textContent !== "—"
    ) {
        return calculated.textContent.trim();
    }


    return "NR";
}


// =========================================================
// REDUCED RUNWAY LENGTH
// =========================================================

function getReducedRunwayItems() {

    const toggle =
        document.getElementById(
            "reduced-rwy-length-toggle"
        );


    if (!toggle || !toggle.checked) {
        return [];
    }


    const rows =
        document.querySelectorAll(
            "#reduced-rwy-length-fields .reduced-rwy-row"
        );


    const items = [];


    rows.forEach((row) => {

        const runway =
            row.querySelector(
                ".reduced-rwy-name"
            )?.value.trim();


        const side =
            row.querySelector(
                ".reduced-rwy-side"
            )?.value;


        const value =
            row.querySelector(
                ".reduced-rwy-value"
            )?.value.trim();


        // Ignore completely empty rows
        if (
            !runway &&
            !side &&
            !value
        ) {
            return;
        }


        if (
            runway &&
            side &&
            value
        ) {

            items.push(
                `RWY ${runway}${side} REDUCED TO ${value}`
            );

        }

    });


    return items;
}


// =========================================================
// SNOWBANKS ON RUNWAY
// =========================================================

function getRunwaySnowbankItems() {

    const toggle =
        document.getElementById(
            "snowbanks-runway-toggle"
        );


    if (!toggle || !toggle.checked) {
        return [];
    }


    const rows =
        document.querySelectorAll(
            "#snowbanks-runway-fields .dynamic-row"
        );


    const items = [];


    rows.forEach((row) => {

        const runway =
            row.querySelector(
                ".snowbank-rwy-name"
            )?.value.trim();


        const side =
            row.querySelector(
                ".snowbank-rwy-side"
            )?.value;


        const distance =
            row.querySelector(
                ".snowbank-rwy-distance"
            )?.value.trim();


        const position =
            row.querySelector(
                ".snowbank-rwy-position"
            )?.value;


        // Ignore empty rows
        if (
            !runway &&
            !side &&
            !distance &&
            !position
        ) {
            return;
        }


        if (
            runway &&
            side &&
            distance &&
            position
        ) {

            items.push(
                `RWY ${runway}${side} SNOW BANK ${position}${distance} FM CL`
            );

        }

    });


    return items;
}


// =========================================================
// SNOWBANKS ON TAXIWAY
// =========================================================

function getTaxiwaySnowbankItems() {

    const toggle =
        document.getElementById(
            "snowbanks-taxiway-toggle"
        );


    if (!toggle || !toggle.checked) {
        return [];
    }


    const rows =
        document.querySelectorAll(
            "#snowbanks-taxiway-fields .dynamic-row"
        );


    const items = [];


    rows.forEach((row) => {

        const taxiway =
            row.querySelector(
                ".snowbank-twy-name"
            )?.value.trim();


        if (taxiway) {

            items.push(
                `TWY ${taxiway} SNOWBANK`
            );

        }

    });


    return items;
}


// =========================================================
// ADJACENT SNOWBANKS
// =========================================================

function getAdjacentSnowbankItem() {

    const toggle =
        document.getElementById(
            "snowbanks-adjacent"
        );


    if (
        !toggle ||
        !toggle.checked
    ) {
        return "";
    }


    const runway =
        getInputValue(
            "runway-designator"
        );


    if (!runway) {
        return "";
    }


    return `RWY ${runway} ADJ SNOW BANKS`;
}


// =========================================================
// TAXIWAY CONDITIONS
// =========================================================

function getTaxiwayConditionItems() {

    const selected =
        getSelectedRadioValue(
            "taxiway-condition"
        );


    // All taxiways poor
    if (selected === "all-poor") {

        return [
            "ALL TWYS POOR"
        ];

    }


    // Specific taxiways
    if (selected === "specific") {

        const rows =
            document.querySelectorAll(
                "#taxiway-condition-fields .dynamic-row"
            );


        const items = [];


        rows.forEach((row) => {

            const taxiway =
                row.querySelector(
                    ".taxiway-condition-name"
                )?.value.trim();


            if (taxiway) {

                items.push(
                    `TWY ${taxiway} POOR`
                );

            }

        });


        return items;
    }


    return [];
}


// =========================================================
// APRON CONDITIONS
// =========================================================

function getApronConditionItems() {

    const selected =
        getSelectedRadioValue(
            "apron-condition"
        );


    // All aprons poor
    if (selected === "all-poor") {

        return [
            "ALL APRONS POOR"
        ];

    }


    // Specific aprons
    if (selected === "specific") {

        const rows =
            document.querySelectorAll(
                "#apron-condition-fields .dynamic-row"
            );


        const items = [];


        rows.forEach((row) => {

            const apron =
                row.querySelector(
                    ".apron-condition-name"
                )?.value.trim();


            if (apron) {

                items.push(
                    `APRON ${apron} POOR`
                );

            }

        });


        return items;
    }


    return [];
}


// =========================================================
// BOX J / K / L
// =========================================================

function getSimpleRunwayItems() {

    const items = [];


    const runway =
        getInputValue(
            "runway-designator"
        );


    const driftingSnow =
        document.getElementById(
            "drifting-snow"
        );


    const looseSand =
        document.getElementById(
            "loose-sand"
        );


    const chemicalTreatment =
        document.getElementById(
            "chemical-treatment"
        );


    if (
        driftingSnow &&
        driftingSnow.checked &&
        runway
    ) {

        items.push(
            `DRIFTING SNOW RWY ${runway}`
        );

    }


    if (
        looseSand &&
        looseSand.checked &&
        runway
    ) {

        items.push(
            `LOOSE SAND RWY ${runway}`
        );

    }


    if (
        chemicalTreatment &&
        chemicalTreatment.checked &&
        runway
    ) {

        items.push(
            `CHEMICAL TREATMENT RWY ${runway}`
        );

    }


    return items;
}


// =========================================================
// GENERATE FINAL MESSAGE
// =========================================================

function generateAFTNMessage() {

    const airport =
        getInputValue(
            "aerodrome"
        );


    const airportCode =
        snowtamAirportCodes[airport] ||
        airport;


    const observationDateTime =
        getSNOWTAMDateTime();


    const runwayDesignator =
        getInputValue(
            "runway-designator"
        );


    // -----------------------------------------------------
    // Basic validation
    // -----------------------------------------------------

    const status =
        document.getElementById(
            "aftn-message-status"
        );


    if (!airportCode) {

        status.textContent =
            "Please select an aerodrome.";

        status.className =
            "aftn-message-status error";

        return;
    }


    if (!observationDateTime) {

        status.textContent =
            "Please enter Observation Date and Time.";

        status.className =
            "aftn-message-status error";

        return;
    }


    if (!runwayDesignator) {

        status.textContent =
            "Please enter Lower Runway Designator.";

        status.className =
            "aftn-message-status error";

        return;
    }


    // -----------------------------------------------------
    // RWYCC
    // -----------------------------------------------------

    const rwyccFirst =
        getFinalRWYCC(
            "first",
            "adjusted-rwycc-first",
            "rwycc-first"
        );


    const rwyccSecond =
        getFinalRWYCC(
            "second",
            "adjusted-rwycc-second",
            "rwycc-second"
        );


    const rwyccThird =
        getFinalRWYCC(
            "third",
            "adjusted-rwycc-third",
            "rwycc-third"
        );


    // -----------------------------------------------------
    // Coverage
    // -----------------------------------------------------

    const coverageFirst =
        getSnowtamCoverage(
            "first"
        );


    const coverageSecond =
        getSnowtamCoverage(
            "second"
        );


    const coverageThird =
        getSnowtamCoverage(
            "third"
        );


    // -----------------------------------------------------
    // Depth
    // -----------------------------------------------------

    const depthFirst =
        getSnowtamDepth(
            "first"
        );


    const depthSecond =
        getSnowtamDepth(
            "second"
        );


    const depthThird =
        getSnowtamDepth(
            "third"
        );


    // -----------------------------------------------------
    // Surface condition
    // -----------------------------------------------------

    const conditionFirst =
        getSnowtamCondition(
            "first"
        );


    const conditionSecond =
        getSnowtamCondition(
            "second"
        );


    const conditionThird =
        getSnowtamCondition(
            "third"
        );


    // -----------------------------------------------------
    // Reduced runway width
    // -----------------------------------------------------

    const reducedWidth =
        getInputValue(
            "reduced-rwy-width"
        );


    // The field is part of the main SNOWTAM line.
    // If it is empty, use NR.
    const reducedWidthValue =
        reducedWidth || "";


    // -----------------------------------------------------
    // Main SNOWTAM line
    // -----------------------------------------------------

    const mainLine =
        [
            airportCode,
            observationDateTime,
            runwayDesignator,
            `${rwyccFirst}/${rwyccSecond}/${rwyccThird}`,
            `${coverageFirst}/${coverageSecond}/${coverageThird}`,
            `${depthFirst}/${depthSecond}/${depthThird}`,
            `${conditionFirst}/${conditionSecond}/${conditionThird}`,
            reducedWidthValue
        ].join(" ");


    // -----------------------------------------------------
    // Optional items
    // -----------------------------------------------------

    const optionalItems = [];


    // Reduced runway length
    optionalItems.push(
        ...getReducedRunwayItems()
    );


    // Drifting snow / loose sand / chemical treatment
    optionalItems.push(
        ...getSimpleRunwayItems()
    );


    // Snowbanks on runway
    optionalItems.push(
        ...getRunwaySnowbankItems()
    );


    // Snowbanks on taxiway
    optionalItems.push(
        ...getTaxiwaySnowbankItems()
    );


    // Adjacent snowbanks
    const adjacentSnowbank =
        getAdjacentSnowbankItem();


    if (adjacentSnowbank) {

        optionalItems.push(
            adjacentSnowbank
        );

    }


    // Taxiway conditions
    optionalItems.push(
        ...getTaxiwayConditionItems()
    );


    // Apron conditions
    optionalItems.push(
        ...getApronConditionItems()
    );


    // Plain-language remarks
    const remarks =
        getInputValue(
            "plain-language-remarks"
        );


    if (remarks) {

        optionalItems.push(
            remarks
        );

    }


    // -----------------------------------------------------
    // Build final message
    // -----------------------------------------------------

    let finalMessage =
        "SNOWTAM\n\n" +
        mainLine;


    if (
        optionalItems.length > 0
    ) {

        finalMessage +=
            "\n\n" +
            optionalItems.join(" ");

    }


    // -----------------------------------------------------
    // Show message
    // -----------------------------------------------------

    const output =
        document.getElementById(
            "generated-aftn-message"
        );


    output.value =
        finalMessage;


    status.textContent =
        "SNOWTAM message generated successfully.";

    status.className =
        "aftn-message-status success";


    // Scroll to generated message
    document
        .getElementById(
            "aftn-generator-box"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


// =========================================================
// COPY MESSAGE
// =========================================================

async function copyAFTNMessage() {

    const output =
        document.getElementById(
            "generated-aftn-message"
        );


    const status =
        document.getElementById(
            "aftn-message-status"
        );


    if (
        !output ||
        !output.value.trim()
    ) {

        status.textContent =
            "Generate the message first.";

        status.className =
            "aftn-message-status error";

        return;
    }


    try {

        await navigator.clipboard.writeText(
            output.value
        );


        status.textContent =
            "Message copied to clipboard.";

        status.className =
            "aftn-message-status success";

    } catch (error) {

        // Fallback for restricted browser environments
        output.focus();
        output.select();

        document.execCommand(
            "copy"
        );


        status.textContent =
            "Message copied to clipboard.";

        status.className =
            "aftn-message-status success";
    }
}


// =========================================================
// NEW SNOTAM / RESET
// =========================================================

function resetSNOTAMForm() {

    const confirmed =
        window.confirm(
            "Start a new SNOTAM? All current information will be cleared."
        );


    if (!confirmed) {
        return;
    }


    // -----------------------------------------------------
    // Clear normal inputs
    // -----------------------------------------------------

    document
        .querySelectorAll(
            "input:not([type='button']):not([type='submit']), textarea, select"
        )
        .forEach((element) => {

            if (
                element.id ===
                "observation-date"
            ) {
                return;
            }

            if (
                element.id ===
                "observation-time"
            ) {
                return;
            }

            element.value = "";

        });


    // -----------------------------------------------------
    // Restore observation date/time
    // -----------------------------------------------------

    setObservationDateTime();


    // -----------------------------------------------------
    // Clear all radio buttons
    // -----------------------------------------------------

    document
        .querySelectorAll(
            "input[type='radio']"
        )
        .forEach((radio) => {

            radio.checked = false;

        });


    // -----------------------------------------------------
    // Clear all checkboxes
    // -----------------------------------------------------

    document
        .querySelectorAll(
            "input[type='checkbox']"
        )
        .forEach((checkbox) => {

            checkbox.checked = false;

        });


    // -----------------------------------------------------
    // Reset calculated RWYCC
    // -----------------------------------------------------

    [
        "first",
        "second",
        "third"
    ].forEach((thirdName) => {

        const rwycc =
            document.getElementById(
                `rwycc-${thirdName}`
            );

        if (rwycc) {
            rwycc.textContent = "—";
        }


        const adjusted =
            document.getElementById(
                `adjusted-rwycc-${thirdName}`
            );

        if (adjusted) {

            adjusted.value = "";

            adjusted.disabled = true;

        }


        const surface =
            document.getElementById(
                `surface-condition-${thirdName}`
            );

        if (surface) {
            surface.hidden = true;
        }


        const coverage =
            document.getElementById(
                `coverage-percentage-${thirdName}`
            );

        if (coverage) {
            coverage.hidden = true;
        }


        const depthField =
            document.getElementById(
                `depth-field-${thirdName}`
            );

        if (depthField) {
            depthField.classList.remove(
                "show-depth"
            );
        }

    });


    // -----------------------------------------------------
    // Hide adjusted RWYCC
    // -----------------------------------------------------

    if (adjustedFields) {

        adjustedFields.hidden =
            true;

    }


    // -----------------------------------------------------
    // Remove dynamic rows
    // -----------------------------------------------------

    const dynamicContainers = [

        "snowbanks-runway-fields",
        "snowbanks-taxiway-fields",
        "taxiway-condition-fields",
        "apron-condition-fields",
        "reduced-rwy-length-fields"

    ];


    dynamicContainers.forEach((id) => {

        const container =
            document.getElementById(id);

        if (!container) {
            return;
        }


        container
            .querySelectorAll(
                ".dynamic-row"
            )
            .forEach((row) => {

                row.remove();

            });


        container.hidden =
            true;

    });


    // -----------------------------------------------------
    // Clear generated message
    // -----------------------------------------------------

    const output =
        document.getElementById(
            "generated-aftn-message"
        );


    if (output) {
        output.value = "";
    }


    const status =
        document.getElementById(
            "aftn-message-status"
        );


    if (status) {

        status.textContent =
            "Ready for a new SNOTAM.";

        status.className =
            "aftn-message-status";

    }


    // -----------------------------------------------------
    // Reset adjusted toggle
    // -----------------------------------------------------

    if (adjustedToggle) {

        adjustedToggle.checked =
            false;

    }


    // -----------------------------------------------------
    // Reset dynamic toggle visibility
    // -----------------------------------------------------

    [
        "snowbanks-runway-toggle",
        "snowbanks-taxiway-toggle",
        "reduced-rwy-length-toggle"
    ].forEach((id) => {

        const checkbox =
            document.getElementById(id);

        if (checkbox) {
            checkbox.checked = false;
        }

    });

}


// =========================================================
// AFTN GENERATOR STYLES
// =========================================================

// Add generator-specific styles without changing
// the existing style.css file.

function loadAFTNGeneratorStyles() {

    if (
        document.getElementById(
            "aftn-generator-styles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "aftn-generator-styles";


    style.textContent = `

        .aftn-generator-box {

            margin-top: 20px;

            padding: 22px;

            background: #f8faf9;

            border: 1px solid #cfdcd6;

            border-radius: 10px;

        }


        .aftn-generator-box h3 {

            margin: 0 0 14px;

            color: #1b4d3c;

            font-size: 16px;

            font-weight: 700;

        }


        .generated-aftn-message {

            width: 100%;

            min-height: 230px;

            padding: 15px;

            resize: vertical;

            font-family:
                Consolas,
                "Courier New",
                monospace;

            font-size: 14px;

            line-height: 1.65;

            color: #1f2c27;

            background: #ffffff;

            border: 1px solid #cbd6d1;

            border-radius: 8px;

            outline: none;

        }


        .generated-aftn-message:focus {

            border-color: #39785f;

            box-shadow:
                0 0 0 3px
                rgba(57, 120, 95, 0.12);

        }


        .aftn-actions {

            display: flex;

            flex-wrap: wrap;

            gap: 10px;

            margin-top: 14px;

        }


        .aftn-button {

            min-height: 42px;

            padding: 0 16px;

            border: 1px solid #bfcfc8;

            border-radius: 7px;

            background: #ffffff;

            color: #285541;

            font-family: inherit;

            font-size: 13px;

            font-weight: 700;

            cursor: pointer;

        }


        .aftn-button:hover {

            background: #edf7f1;

            border-color: #579276;

        }


        .aftn-button.primary {

            color: #ffffff;

            background: #285f49;

            border-color: #285f49;

        }


        .aftn-button.primary:hover {

            background: #214e3d;

        }


        .aftn-button.reset {

            color: #8a4b4b;

        }


        .aftn-button.reset:hover {

            background: #fbefef;

            border-color: #c99999;

        }


        .aftn-message-status {

            min-height: 20px;

            margin-top: 10px;

            font-size: 12px;

            font-weight: 600;

        }


        .aftn-message-status.success {

            color: #286449;

        }


        .aftn-message-status.error {

            color: #9a4c4c;

        }


        @media (max-width: 650px) {

            .aftn-generator-box {

                padding: 16px;

            }


            .aftn-actions {

                flex-direction: column;

            }


            .aftn-button {

                width: 100%;

            }


            .generated-aftn-message {

                min-height: 280px;

                font-size: 13px;

            }

        }

    `;


    document.head.appendChild(
        style
    );
}


// =========================================================
// INITIALIZE AFTN GENERATOR
// =========================================================

loadAFTNGeneratorStyles();

createMessageGeneratorUI();