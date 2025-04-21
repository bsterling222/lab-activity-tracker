document.addEventListener('DOMContentLoaded', () => {

    let sheets = {
        Devices: [],
        Solutions: [],
        Chemicals: [],
        Instruments: [],
        Actions: [],
        Logs: []
    
    };

    let sessionLogs = [];
// References to DOM elements
    const loginForm = document.getElementById('login-form');
    const userInput = document.getElementById('user-initials');
    const loginSection = document.getElementById('login-section');
    const mainMenu = document.getElementById('main-menu');
    const logoutButton = document.getElementById('logout-button');
    const solutionsSection = document.getElementById('solutions');
    const solutionsList = document.getElementById('solutions-list');
    const newSolutionSection = document.getElementById('makeSolutionButton');
    const backToMenuButton = document.getElementById("backToMenuButton");
    const excelInput = document.getElementById('excel-file');
    const uploadSection = document.getElementById('excel-upload-section');
    const fileNameDisplay = document.getElementById('file-name-display');
    const clearFileButton = document.getElementById('clear-file-button');
    const trackActivityButton = document.getElementById('trackActivityButton');
    const undoButton = document.getElementById('undoButton');
    const generateLabelsButton = document.getElementById('generateLabelsButton');
    const labelSettings = document.getElementById('label-settings');
    const labelTypeSelect = document.getElementById('label-type');
    const skipLabelsInput = document.getElementById('skip-labels');
    const labelOptions = document.getElementById('label-options');
    const generatePDFButton = document.getElementById('generatePDFButton');
    const cancelLabelSettings = document.getElementById('cancelLabelSettings');
    const solutionsButton = document.getElementById('solutionsButton');
    const selectAllLabels = document.getElementById('selectAllLabels');
    const deselectAllLabels = document.getElementById('deselectAllLabels');
    const existingDropdown = document.getElementById("existing-solution");
    const barcodeField = document.getElementById("generated-barcode");
    const startChemicalScanBtn = document.getElementById("start-chemical-scan");
    const scannedChemicalsList = document.getElementById("scanned-chemicals-list");


// Login form Submission Handling
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const initials = userInput.value.trim().toUpperCase();

        if (initials === ""){
            alert("Please enter your initals.");
            return;
        }

        sessionStorage.setItem('userInitials', initials);
        loginSection.style.display = "none";
        mainMenu.style.display = "block";
        uploadSection.style.display = "block";
    });

// Logout Button Listener
    logoutButton.addEventListener('click', () => {
        if (sessionLogs.length > 0) {
            // Build summary
            let summary = "Session Summary:\n\n";

            sessionLogs.forEach(log => {
                summary += `• ${log.type}: ${log.name}`;
                if (log.amount) summary += ` — ${log.amount}`;
                summary += `\n`;
            });

            alert(summary);
        }
        // Reset input and session logs
        mainMenu.style.display = "none";
        loginSection.style.display = "block";
        uploadSection.style.display = "none";
        userInput.value = "";
        sessionLogs = [];
    });

// Solutions Section 
    solutionsButton.addEventListener('click',() => {
        solutionsSection.style.display = "block";
        mainMenu.style.display = 'none';
        uploadSection.style.display = "none";
    });

// New Solutions Section 
    newSolutionSection.addEventListener('click', () => {
        solutionsSection.style.display = 'none';
        document.getElementById('make-solution-section').style.display = 'block';
    });

    document.getElementById("cancel-make-solution").addEventListener("click", () => {
        document.getElementById("make-solution-section").style.display = "none";
        document.getElementById("solutions").style.display = "block";
    });

// Back to Main Menu Button 
    backToMenuButton.addEventListener('click',() => {
        mainMenu.style.display = "block";
        solutionsSection.style.display = 'none';
        uploadSection.style.display = "block";
    });

// Undo Last Action button 
    undoButton.addEventListener('click', undoLastAction);

// Show Excel file input after login
    excelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        fileNameDisplay.textContent = `Selected File: ${file.name}`;

        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetNames = workbook.SheetNames;

            sheetNames.forEach(name => {
                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: "" });
                sheets[name] = sheetData;

                if (name === 'Solutions') {
                    // ✅ 1. Update Solutions Buttons
                    solutionsList.innerHTML = '';
                    sheetData.forEach(solution => {
                        const solutionName = solution['Solution'];
                        if (!solutionName) return;

                        const button = document.createElement('button');
                        button.textContent = solutionName;

                        button.addEventListener('click', () => {
                            alert(`Used: ${solutionName}`);
                            solutionsSection.style.display = 'none';
                            mainMenu.style.display = 'block';
                        });

                        solutionsList.appendChild(button);
                    });

                    // ✅ 2. Update the "existing-solution" dropdown menu
                    const existingDropdown = document.getElementById('existing-solution');
                    if (existingDropdown) {
                        // Clear existing options
                        existingDropdown.innerHTML = `
                            <option value="">-- Select or Create --</option>
                            <option value="__new__">+ Create New Solution</option>
                        `;

                        // Add options from Excel
                        sheetData.forEach(solution => {
                            const solutionName = solution['Solution'];
                            if (!solutionName) return;

                            const option = document.createElement('option');
                            option.value = solutionName;
                            option.textContent = solutionName;
                            existingDropdown.appendChild(option);
                        });
                    }
                }
            });

            console.log("Loaded Sheets:", sheets);
        };

        reader.readAsArrayBuffer(file);
    });

// Clear File Button Listener 
    clearFileButton.addEventListener('click', () => {
        excelInput.value = ''; // Reset file input
        fileNameDisplay.textContent = ''; // Clear filename text
        sheets = {              // Reset all sheets to empty
            Devices: [],
            Solutions: [],
            Chemicals: [],
            Instruments: [],
            Actions: [],
            Logs: []
        };
        solutionsList.innerHTML = ''; // Also clear the buttons if needed
    });

// Generate Labels Button
    generateLabelsButton.addEventListener('click', () => {
        mainMenu.style.display = "none";
        labelSettings.style.display = "block";
        updateLabelOptions(); // Populate fields dynamically based on default selection
    });
    
    cancelLabelSettings.addEventListener('click', () => {
        labelSettings.style.display = "none";
        mainMenu.style.display = "block";
    });
    
    labelTypeSelect.addEventListener('change', updateLabelOptions);
    
    function updateLabelOptions() {
        const type = labelTypeSelect.value;
        labelOptions.innerHTML = ''; // Clear extra input fields
        updateLabelCheckboxes(type); // Populate checkboxes
    
        if (type === 'Solution') {
            labelOptions.innerHTML = `
                <label for="solution-volume">Volume (mL):</label>
                <input type="number" id="solution-volume" required />
                <label for="solution-date">Date Made:</label>
                <input type="date" id="solution-date" required />
            `;
        } 
    }
    
    function updateLabelCheckboxes(type) {
        const container = document.getElementById("label-checkboxes");
        container.innerHTML = "";

        let items = [];

        if (type === "All") {
            ["Chemical", "Solution", "Device", "Instrument"].forEach((t) => {
                const sheet = sheets[t + "s"];
                if (sheet && sheet.length) {
                    sheet.forEach((entry, i) => {
                        items.push({
                            name: entry["Chemical"] || entry["Solution"] || entry["Device"] || entry["Instrument"] || Object.values(entry)[0] || `Item ${items.length + 1}`,
                            type: t,
                            index: i,
                        });
                    });
                }
            });
        } else {
            const list = sheets[type + "s"];
            if (!list || list.length === 0) {
                container.innerHTML = `<p>No ${type.toLowerCase()}s found in inventory.</p>`;
                return;
            }

            list.forEach((item, index) => {
                const name = item["Chemical"] || item["Solution"] || item["Device"] || item["Instrument"] || Object.values(item)[0] || `Item ${index + 1}`;
                items.push({ name, type, index });
            });
        }

        // Now render the combined list
        if (items.length === 0) {
            container.innerHTML = `<p>No items found in inventory.</p>`;
            return;
        }

        items.forEach((item, globalIndex) => {
            const id = `label-${item.type}-${item.index}`;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "label-checkbox";
            checkbox.dataset.index = item.index;
            checkbox.dataset.type = item.type;
            checkbox.id = id;

            const label = document.createElement("label");
            label.htmlFor = id;
            label.textContent = `${item.name} (${item.type})`;

            const wrapper = document.createElement("div");
            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);

            container.appendChild(wrapper);
        });
    }

    function wrapText(doc, text, maxWidth, maxCharsPerLine = 30) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";
    
        for (let i = 0; i < words.length; i++) {
            let word = words[i].trim();
            let testLine = currentLine ? currentLine + " " + word : word;
    
            if (doc.getTextWidth(testLine) < maxWidth && testLine.length <= maxCharsPerLine) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                while (word.length > 0) {
                    let cutoff = Math.min(word.length, maxCharsPerLine);
                    while (cutoff > 0 && (doc.getTextWidth(word.slice(0, cutoff)) > maxWidth)) {
                        cutoff--;
                    }
                    if (cutoff === 0) break;
                    lines.push(word.slice(0, cutoff));
                    word = word.slice(cutoff);
                }
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }
    
    generatePDFButton.addEventListener('click', async () => {
        const selectedType = labelTypeSelect.value;
        const skip = parseInt(skipLabelsInput.value) || 0;
        const selectedCheckboxes = Array.from(document.querySelectorAll('.label-checkbox')).filter(cb => cb.checked);
    
        if (selectedCheckboxes.length === 0) {
            alert("Please select at least one item to generate labels.");
            return;
        }
    
        const selectedIndexes = selectedCheckboxes.map(cb => parseInt(cb.dataset.index));
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: "letter" });
    
        const labelsPerRow = 3;
        const labelWidth = 66.675;
        const labelHeight = 25.4;
        const marginX = 3.8;
        const marginY = 12.3;
        const spacingX = 4.175;
        const spacingY = 0.2;
        const today = new Date().toISOString().slice(0, 10);
        const initials = sessionStorage.getItem('userInitials') || "N/A";
    
        if (selectedType === "Chemical") {
            const items = sheets.Chemicals;
    
            for (let i = 0; i < selectedIndexes.length; i++) {
                const index = selectedIndexes[i];
                const item = items[index];
                const position = i + skip;
    
                const row = Math.floor((position % 30) / labelsPerRow);
                const col = position % labelsPerRow;
                const x = marginX + col * (labelWidth + spacingX);
                const y = marginY + row * (labelHeight + spacingY);
    
                const nameTop = y + 4;
                const lineHeight = 4;
                const infoSpacing = 1.5;
                const barcodeSpacing = 2;
                const barcodeWidth = 40;
                const barcodeHeight = 5;
    
                doc.setFont(undefined, "normal");
                doc.setFontSize(9);
    
                const chemicalName = item["Chemical"] || `Item ${index + 1}`;
                let nameLines = wrapText(doc, chemicalName, labelWidth).slice(0, 2);
    
                nameLines.forEach((line, idx) => {
                    const yOffset = nameTop + idx * lineHeight;
                    const xOffset = x + (labelWidth - doc.getTextWidth(line)) / 2;
                    doc.text(line, xOffset, yOffset);
                });
    
                doc.setFontSize(7);
                const cas = item["CAS Number"] || "N/A";
                const mfr = item["Manufacturer"] || "N/A";
                const infoLine = `CAS: ${cas} | Mfn: ${mfr}`;
                const infoY = nameTop + nameLines.length * lineHeight + infoSpacing;
                doc.text(infoLine, x + (labelWidth - doc.getTextWidth(infoLine)) / 2, infoY);
    
                const barcodeValue = item["Barcode"]?.toString();
                if (barcodeValue && barcodeValue.trim() !== "") {
                    const barcodeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    JsBarcode(barcodeSvg, barcodeValue, {
                        format: "CODE128",
                        displayValue: false,
                        height: 10,
                        width: 1.5,
                        margin: 0
                    });
    
                    const canvas = document.createElement("canvas");
                    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
                    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(svgBlob);
    
                    const img = new Image();
                    await new Promise(resolve => {
                        img.onload = function () {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            canvas.getContext("2d").drawImage(img, 0, 0);
                            URL.revokeObjectURL(url);
                            resolve();
                        };
                        img.src = url;
                    });
    
                    const barcodeDataUrl = canvas.toDataURL("image/png");
                    const barcodeY = y + labelHeight - 12;
                    doc.addImage(barcodeDataUrl, "PNG", x + (labelWidth - barcodeWidth) / 2, barcodeY, barcodeWidth, barcodeHeight);
    
                    const barcodeTextY = barcodeY + barcodeHeight + 4;
                    doc.text(barcodeValue, x + (labelWidth - doc.getTextWidth(barcodeValue)) / 2, barcodeTextY);
                }
    
                if ((position + 1) % 30 === 0 && i + 1 < selectedIndexes.length) {
                    doc.addPage();
                }
            }
    
            doc.save(`Chemical_Labels_${today}.pdf`);
        }
    
        else if (selectedType === "Solution") {
            const items = sheets.Solutions;
            const volume = document.getElementById("solution-volume")?.value || "N/A";
            const date = document.getElementById("solution-date")?.value || "N/A";
    
            for (let i = 0; i < selectedIndexes.length; i++) {
                const index = selectedIndexes[i];
                const item = items[index];
                const position = i + skip;
    
                const row = Math.floor((position % 30) / labelsPerRow);
                const col = position % labelsPerRow;
                const x = marginX + col * (labelWidth + spacingX);
                const y = marginY + row * (labelHeight + spacingY);
    
                const nameTop = y + 4;
                const lineHeight = 4;
                const infoSpacing = 1.5;
                const barcodeSpacing = 2;
                const barcodeWidth = 40;
                const barcodeHeight = 5;
    
                doc.setFont(undefined, "normal");
                doc.setFontSize(9);
    
                const solutionName = item["Solution"] || `Item ${index + 1}`;
                let nameLines = wrapText(doc, solutionName, labelWidth).slice(0, 2);
    
                nameLines.forEach((line, idx) => {
                    const yOffset = nameTop + idx * lineHeight;
                    const xOffset = x + (labelWidth - doc.getTextWidth(line)) / 2;
                    doc.text(line, xOffset, yOffset);
                });
    
                doc.setFontSize(7);
                const infoLine = `Vol: ${volume} mL | Date: ${date} | ${initials}`;
                const infoY = nameTop + nameLines.length * lineHeight + infoSpacing;
                doc.text(infoLine, x + (labelWidth - doc.getTextWidth(infoLine)) / 2, infoY);
    
                const barcodeValue = item["Barcode"]?.toString();
                if (barcodeValue && barcodeValue.trim() !== "") {
                    const barcodeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    JsBarcode(barcodeSvg, barcodeValue, {
                        format: "CODE128",
                        displayValue: false,
                        height: 10,
                        width: 1.5,
                        margin: 0
                    });
    
                    const canvas = document.createElement("canvas");
                    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
                    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(svgBlob);
    
                    const img = new Image();
                    await new Promise(resolve => {
                        img.onload = function () {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            canvas.getContext("2d").drawImage(img, 0, 0);
                            URL.revokeObjectURL(url);
                            resolve();
                        };
                        img.src = url;
                    });
    
                    const barcodeDataUrl = canvas.toDataURL("image/png");
                    const barcodeY = y + labelHeight - 12;
                    doc.addImage(barcodeDataUrl, "PNG", x + (labelWidth - barcodeWidth) / 2, barcodeY, barcodeWidth, barcodeHeight);
    
                    const barcodeTextY = barcodeY + barcodeHeight + 4;
                    doc.text(barcodeValue, x + (labelWidth - doc.getTextWidth(barcodeValue)) / 2, barcodeTextY);
                }
    
                if ((position + 1) % 30 === 0 && i + 1 < selectedIndexes.length) {
                    doc.addPage();
                }
            }
    
            doc.save(`Solution_Labels_${today}.pdf`);
        }

        else if (selectedType === "Device") {
            const items = sheets.Devices;
        
            for (let i = 0; i < selectedIndexes.length; i++) {
                const index = selectedIndexes[i];
                const item = items[index];
                const position = i + skip;
        
                const row = Math.floor((position % 30) / labelsPerRow);
                const col = position % labelsPerRow;
        
                const x = marginX + col * (labelWidth + spacingX);
                const y = marginY + row * (labelHeight + spacingY);
        
                const nameTop = y + 4;
                const lineHeight = 4;
                const barcodeWidth = 40;
                const barcodeHeight = 5;
        
                // 1. Device Name
                doc.setFont(undefined, "normal");
                doc.setFontSize(9);
                const deviceName = item["Device"] || `Item ${index + 1}`;
                const nameLines = wrapText(doc, deviceName, labelWidth).slice(0, 2);
                nameLines.forEach((line, idx) => {
                    const yOffset = nameTop + idx * lineHeight;
                    const xOffset = x + (labelWidth - doc.getTextWidth(line)) / 2;
                    doc.text(line, xOffset, yOffset);
                });
        
                // 2. DOF from Excel + Initials
                doc.setFontSize(7);
                let dofRaw = item["Date of Fabrication"];
                let dof = "N/A";

                if (typeof dofRaw === "number") {
                    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                    const msPerDay = 24 * 60 * 60 * 1000;
                    const dateObj = new Date(excelEpoch.getTime() + dofRaw * msPerDay);

                    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getUTCDate()).padStart(2, '0');
                    const year = dateObj.getUTCFullYear();

                    dof = `${month}/${day}/${year}`;
                } else if (typeof dofRaw === "string" && dofRaw.trim()) {
                    dof = dofRaw.trim();
                }

                const initials = sessionStorage.getItem('userInitials') || "N/A";
                const infoLine = `DOF: ${dof} | ${initials}`;
                const infoY = nameTop + nameLines.length * lineHeight + 1.5;
                doc.text(infoLine, x + (labelWidth - doc.getTextWidth(infoLine)) / 2, infoY);
        
                // 3. Barcode
                const barcodeValue = item["Barcode"];
                if (barcodeValue) {
                    const barcodeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    JsBarcode(barcodeSvg, barcodeValue.toString(), {
                        format: "CODE128",
                        displayValue: false,
                        height: 10,
                        width: 1.5,
                        margin: 0
                    });
        
                    const canvas = document.createElement("canvas");
                    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
                    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(svgBlob);
        
                    const img = new Image();
                    await new Promise(resolve => {
                        img.onload = function () {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            canvas.getContext("2d").drawImage(img, 0, 0);
                            URL.revokeObjectURL(url);
                            resolve();
                        };
                        img.src = url;
                    });
        
                    const barcodeDataUrl = canvas.toDataURL("image/png");
                    const barcodeY = y + labelHeight - 12;
                    doc.addImage(barcodeDataUrl, "PNG", x + (labelWidth - barcodeWidth) / 2, barcodeY, barcodeWidth, barcodeHeight);
        
                    // Barcode text
                    doc.setFontSize(7);
                    const barcodeTextY = barcodeY + barcodeHeight + 4;
                    doc.text(barcodeValue.toString(), x + (labelWidth - doc.getTextWidth(barcodeValue.toString())) / 2, barcodeTextY);
                }
        
                if ((position + 1) % 30 === 0 && i + 1 < selectedIndexes.length) {
                    doc.addPage();
                }
            }
        
            doc.save(`Device_Labels_${today}.pdf`);
            return;
        }

        else if (selectedType === "Instrument") {
            const items = sheets.Instruments;
        
            for (let i = 0; i < selectedIndexes.length; i++) {
                const index = selectedIndexes[i];
                const item = items[index];
                const position = i + skip;
        
                const row = Math.floor((position % 30) / labelsPerRow);
                const col = position % labelsPerRow;
        
                const x = marginX + col * (labelWidth + spacingX);
                const y = marginY + row * (labelHeight + spacingY);
        
                const nameTop = y + 4;
                const lineHeight = 4;
                const barcodeWidth = 40;
                const barcodeHeight = 5;
        
                // 1. Instrument Name
                doc.setFont(undefined, "normal");
                doc.setFontSize(9);
                const name = item["Instrument"] || `Item ${index + 1}`;
                const nameLines = wrapText(doc, name, labelWidth).slice(0, 2);
                nameLines.forEach((line, idx) => {
                    const yOffset = nameTop + idx * lineHeight;
                    const xOffset = x + (labelWidth - doc.getTextWidth(line)) / 2;
                    doc.text(line, xOffset, yOffset);
                });
        
                // 2. Manufacturer (if present)
                doc.setFontSize(7);
                const mfr = item["Manufacturer"] || "N/A";
                const mfrLine = `Mfn: ${mfr}`;
                const infoY = nameTop + nameLines.length * lineHeight + 1.5;
                doc.text(mfrLine, x + (labelWidth - doc.getTextWidth(mfrLine)) / 2, infoY);
        
                // 3. Barcode
                const barcodeValue = item["Barcode"];
                if (barcodeValue) {
                    const barcodeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    JsBarcode(barcodeSvg, barcodeValue.toString(), {
                        format: "CODE128",
                        displayValue: false,
                        height: 10,
                        width: 1.5,
                        margin: 0
                    });
        
                    const canvas = document.createElement("canvas");
                    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
                    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(svgBlob);
        
                    const img = new Image();
                    await new Promise(resolve => {
                        img.onload = function () {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            canvas.getContext("2d").drawImage(img, 0, 0);
                            URL.revokeObjectURL(url);
                            resolve();
                        };
                        img.src = url;
                    });
        
                    const barcodeDataUrl = canvas.toDataURL("image/png");
                    const barcodeY = y + labelHeight - 12;
                    doc.addImage(barcodeDataUrl, "PNG", x + (labelWidth - barcodeWidth) / 2, barcodeY, barcodeWidth, barcodeHeight);
        
                    // Barcode text
                    doc.setFontSize(7);
                    const barcodeTextY = barcodeY + barcodeHeight + 4;
                    doc.text(barcodeValue.toString(), x + (labelWidth - doc.getTextWidth(barcodeValue.toString())) / 2, barcodeTextY);
                }
        
                if ((position + 1) % 30 === 0 && i + 1 < selectedIndexes.length) {
                    doc.addPage();
                }
            }
        
            doc.save(`Instrument_Labels_${today}.pdf`);
            return;
        }
        
        else {
            alert("Label generation for this type is not yet implemented.");
        }
    });
    
   
    cancelLabelSettings.addEventListener('click', () => {
        labelSettings.style.display = "none";
        mainMenu.style.display = "block";
    });

    selectAllLabels.addEventListener('click', () => {
        document.querySelectorAll('.label-checkbox').forEach(cb => cb.checked = true);
    });
    
    deselectAllLabels.addEventListener('click', () => {
        document.querySelectorAll('.label-checkbox').forEach(cb => cb.checked = false);
    });   

// Activity Tracker Button
    trackActivityButton.addEventListener('click', () => {
        const scannerOverlay = document.createElement('div');
        scannerOverlay.id = 'scanner-overlay';
        scannerOverlay.innerHTML = `
            <div class="scanner-overlay-content">
                <button id="close-scanner-button" class="button-standard">✖ Close</button>
                <div id="scanner"></div>
            </div>
        `;
        document.body.appendChild(scannerOverlay);
        startScanner();

        document.getElementById("close-scanner-button").addEventListener("click", () => {
            stopScanner(); // Manual close
        });

        function startScanner() {
            Quagga.init({
                inputStream: {
                    type: "LiveStream",
                    target: document.querySelector("#scanner"),
                    constraints: {
                        facingMode: "environment"
                    }
                },
                decoder: {
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader"]
                }
            }, function (err) {
                if (err) {
                    alert("Failed to start scanner: " + err);
                    stopScanner();
                    return;
                }
                Quagga.start();
            });

            Quagga.onDetected((result) => {
                const code = result.codeResult.code;
                console.log("Scanned barcode:", code);

                // Auto close on scan
                stopScanner();

                // Now handle the scanned barcode (Step 5)
                handleScannedBarcode(code);
            });
        }

        function stopScanner() {
            Quagga.stop();
            Quagga.offDetected(); // cleanup
            const overlay = document.getElementById("scanner-overlay");
            if (overlay) overlay.remove();
        }
    }); 

// Handle the Scanned Barcode
    function handleScannedBarcode(code) {
        const user = sessionStorage.getItem('userInitials') || "N/A";
        const timestamp = new Date().toISOString();

        const device = sheets.Devices.find(item => item.Barcode?.toString() === code);
        const solution = sheets.Solutions.find(item => item.Barcode?.toString() === code);
        const chemical = sheets.Chemicals.find(item => item.Barcode?.toString() === code);

        let logEntry = {
            timestamp,
            user,
            action: "Used",
            type: "",
            name: "",
            amount: "",
            barcode: code
        };

        if (device) {
            logEntry.type = "Device";
            logEntry.name = device.Device;
        } 
        else if (solution) {
            const usedAmount = prompt(`How many mL of "${solution.Solution}" did you use?`);
            if (!usedAmount || isNaN(usedAmount)) return;

            const reused = confirm(`Did you REUSE "${solution.Solution}"? Click Ok for YES, Cancel for NO.`);

            logEntry.type = "Solution";
            logEntry.name = solution.Solution;
            logEntry.amount = `${usedAmount} mL${reused ? " (Reused)" : ""}`;

            if (!reused && solution["Amount Left"]) {
                const current = parseFloat(solution["Amount Left"]);
                const remaining = current - parseFloat(usedAmount);
                solution["Amount Left"] = remaining >= 0 ? remaining : 0;
            }
        } 
        else if (chemical) {
            const usedAmount = prompt(`How many grams of "${chemical.Chemical}" did you use?`);
            if (!usedAmount || isNaN(usedAmount)) return;

            logEntry.type = "Chemical";
            logEntry.name = chemical.Chemical;
            logEntry.amount = `${usedAmount} g`;

            if (chemical["Total Left"]) {
                const current = parseFloat(chemical["Total Left"]);
                const remaining = current - parseFloat(usedAmount);
                chemical["Total Left"] = remaining >= 0 ? remaining : 0;
            }
        } 
        else {
            console.log("No matching item found for barcode:", code);
            return;
        }

        sheets.Logs.push(logEntry);
        sessionLogs.push(logEntry);
        console.log("Log entry recorded:", logEntry);
    }

// Undo Last Action Button
    function undoLastAction() {
        if (sessionLogs.length === 0) {
            alert("No actions to undo.");
            return;
        }
    
        const lastEntry = sessionLogs.pop();
        const indexInLog = sheets.Logs.findIndex(log => log.timestamp === lastEntry.timestamp && log.barcode === lastEntry.barcode);
    
        if (indexInLog !== -1) {
            sheets.Logs.splice(indexInLog, 1); // remove from logs
        }
    
        // Restore quantities
        if (lastEntry.type === "Solution") {
            const solution = sheets.Solutions.find(item => item.Barcode?.toString() === lastEntry.barcode);
            if (solution && lastEntry.amount && !lastEntry.amount.includes("(Reused)")) {
                const amt = parseFloat(lastEntry.amount);
                if (!isNaN(amt)) {
                    solution["Amount Left"] = (parseFloat(solution["Amount Left"]) || 0) + amt;
                }
            }
        }
    
        if (lastEntry.type === "Chemical") {
            const chemical = sheets.Chemicals.find(item => item.Barcode?.toString() === lastEntry.barcode);
            if (chemical && lastEntry.amount) {
                const amt = parseFloat(lastEntry.amount);
                if (!isNaN(amt)) {
                    chemical["Total Left"] = (parseFloat(chemical["Total Left"]) || 0) + amt;
                }
            }
        }
    
        alert(`Last ${lastEntry.type} action undone.`);
    }

    function generateUniqueBarcode(existing = []) {
        let barcode;
        do {
            barcode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        } while (existing.includes(barcode));
        return barcode;
    }

    existingDropdown.addEventListener("change", () => {
        const selected = existingDropdown.value;
    
        // Show or hide "New Solution Name" input
        const newNameContainer = document.getElementById("new-solution-name-container");
        if (selected === "__new__") {
            newNameContainer.style.display = "block";
            barcodeField.value = generateUniqueBarcode(getAllBarcodes());  // new barcode
        } else if (selected) {
            newNameContainer.style.display = "none";
    
            // 🧠 Find the matching solution in the Excel data
            const matched = sheets.Solutions.find(sol => sol["Solution"] === selected);
            if (matched && matched["Barcode"]) {
                barcodeField.value = matched["Barcode"];
            } else {
                barcodeField.value = "MISSING"; // Optional fallback
            }
        } else {
            newNameContainer.style.display = "none";
            barcodeField.value = ""; // Reset
        }
    });
    
    function getAllBarcodes() {
        return [
            ...sheets.Chemicals.map(c => c.Barcode?.toString() || ""),
            ...sheets.Solutions.map(s => s.Barcode?.toString() || ""),
            ...sheets.Devices.map(d => d.Barcode?.toString() || ""),
            ...sheets.Instruments.map(i => i.Barcode?.toString() || "")
        ].filter(code => code);
    }
    
    startChemicalScanBtn.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.id = "scanner-overlay";
        overlay.innerHTML = `
            <div class="scanner-overlay-content">
                <button id="close-scanner-button" class="button-standard">✖ Close</button>
                <div id="scanner"></div>
            </div>
        `;
        document.body.appendChild(overlay);
    
        document.getElementById("close-scanner-button").addEventListener("click", () => stopScanner());
    
        Quagga.init({
            inputStream: {
                type: "LiveStream",
                target: document.querySelector("#scanner"),
                constraints: { facingMode: "environment" }
            },
            decoder: { readers: ["code_128_reader", "ean_reader", "upc_reader"] }
        }, (err) => {
            if (err) {
                alert("Failed to start scanner: " + err);
                stopScanner();
                return;
            }
            Quagga.start();
        });
    
        Quagga.onDetected(async (result) => {
            const code = result.codeResult.code;
            const match = sheets.Chemicals.find(item => item.Barcode?.toString() === code);
            
            if (!match) {
                alert(`No chemical found for barcode: ${code}`);
                return;
            }
    
            const usedAmount = prompt(`How many grams of "${match.Chemical}" did you use?`);
            if (!usedAmount || isNaN(usedAmount)) return;
    
            // Subtract from total left
            if (match["Total Left"]) {
                const current = parseFloat(match["Total Left"]);
                const remaining = current - parseFloat(usedAmount);
                match["Total Left"] = remaining >= 0 ? remaining : 0;
            }
    
            // Log to UI
            const li = document.createElement("li");
            li.textContent = `${match.Chemical}: -${usedAmount} g`;
            scannedChemicalsList.appendChild(li);
        });
    
        function stopScanner() {
            Quagga.stop();
            Quagga.offDetected();
            const overlay = document.getElementById("scanner-overlay");
            if (overlay) overlay.remove();
        }
    });
    
});