// Waits for the page to fully load before rendering lists
        document.addEventListener("DOMContentLoaded", () => {
            renderLists();
            recentColorfunc();
        });


         //----Animations----
        gsap.from("h1",{y:-10, duration: 1, ease:"power2.out"})
        gsap.to("h1",{y:25, duration: 1, ease:"power2.out"});

        // --- ELEMENT SELECTION ---
        const box = document.getElementById("box");
        const slider_1 = document.getElementById("r");
        const slider_2 = document.getElementById("g");    
        const slider_3 = document.getElementById("b");
        const reset_btn = document.getElementById("reset_btn");
        const hexCode = document.getElementById("hex-code");
        const rgbCode = document.getElementById("rgb-code");
        const copybtnRGB = document.querySelector("#copy-btn-rgb")
        const copybtnHEX = document.querySelector("#copy-btn-hex")
        const favList = document.getElementById("favorite-list")
        const favSlider = document.getElementById("fav-slider");
        const clearRecentBtn = document.getElementById("clear-recent-btn")
        
        // --- GLOBAL VARIABLES ---
        let activeSlider = null;
        let rVal = 0;
        let gVal = 0;
        let bVal = 0;
        let holdIntervalPlus;
        let holdIntervalMinus;
        let favoriteColors = []
        let recentColors = []
        

        //Slider input listeners
        slider_1.addEventListener("input", updateValues);
        slider_2.addEventListener("input", updateValues);
        slider_3.addEventListener("input", updateValues);

        //Reset button event
        reset_btn.addEventListener("click", resetColors);

        //Copy buttons for RGB and HEX
        copybtnHEX.addEventListener("click", () => copytoClipboard(hexCode, copybtnHEX));
        copybtnRGB.addEventListener("click", () => copytoClipboard(rgbCode, copybtnRGB));

        //Clear recent button
        clearRecentBtn.addEventListener("click", ()=>{
            recentColors = [];
            localStorage.setItem("recentColors", JSON.stringify(recentColors));
            renderLists();
        });


        //Increment value button listener
        btn_plus.addEventListener("mousedown", () => {
        changeValues("up"); 
        holdIntervalPlus = setInterval(() => changeValues("up"), 100);
        });
        
        //Decrement value button listener
        btn_minus.addEventListener("mousedown", () => {
            changeValues("down"); 
            holdIntervalMinus = setInterval(() => changeValues("down"), 100);
        });
        
        //Event listeners for stopping incrementation or decrementation
        ["mouseup", "mouseleave"].forEach(eventType => {
            btn_plus.addEventListener(eventType, () => clearInterval(holdIntervalPlus));
            btn_minus.addEventListener(eventType, () => clearInterval(holdIntervalMinus));
        });
        
        // --- IMPORT FAVORITE COLORS ---
        // Triggered when the user selects a file to import
        document.getElementById("importFavInput").addEventListener("change", (e)=>{
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) =>{
                try{
                    favoriteColors = JSON.parse(event.target.result);
                    saveToLocalStorage();
                    renderLists();
                }
                catch{
                    alert("Invalid file format");
                }
            };

            reader.readAsText(file)
        })

        // --- EXPORT FAVORITE COLORS ---
        // Triggered when the user clicks the Export button
        document.getElementById("exportFavBtn").addEventListener("click", ()=>{
            const blob = new Blob([JSON.stringify(favoriteColors)], {type:"application/json"});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "favoriteColors.json"
            link.click();
        })

        document.getElementById("importFavBtn").addEventListener("click", ()=>{
            document.getElementById("importFavInput").click();
        })
        
        slider_1.nextElementSibling.textContent = 0;
        slider_2.nextElementSibling.textContent = 0;
        slider_3.nextElementSibling.textContent = 0;

        //Using buttons for adding and removing colors from recent and favorites
        function attachButtonListeners(){
            document.querySelectorAll(".addFavBtn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const color = btn.dataset.color;
                    if (!favoriteColors.includes(color)) {
                        favoriteColors.unshift(color);
                        saveToLocalStorage();
                        renderLists();
                 }
             });
         });

         // Loop through all "remove" buttons and attach click event listeners
            document.querySelectorAll(".removeBtn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const color = btn.dataset.color;
                    if(btn.closest("#recent-list")){
                        recentColors = recentColors.filter(c => c !== color);
                    }
                    else{
                        favoriteColors = favoriteColors.filter(c => c !== color)
                    }
                    saveToLocalStorage();
                    renderLists();
                 });
             });

             // Loop through all "copy color" buttons and attach click event listeners
             document.querySelectorAll(".copyColorBtn").forEach(btn=>{
                btn.addEventListener("click", () =>{
                    const color = btn.dataset.color;
                    navigator.clipboard.writeText(color);
                    btn.textContent = "✅";
                    setTimeout(() => {
                        btn.textContent = "📋"
                    }, 1000);
                } )
             })
        }

        //Saving color to local memory
        function saveToLocalStorage(){
            localStorage.setItem("favoriteColors", JSON.stringify(favoriteColors))
            localStorage.setItem("recentColors", JSON.stringify(recentColors))
        };

        //Loading color from local memory
        function loadFromLocalStorage(){
            favoriteColors = JSON.parse(localStorage.getItem("favoriteColors")) || [];
            recentColors = JSON.parse(localStorage.getItem("recentColors")) || [];
        };

        loadFromLocalStorage()

        //Adding the last color after waiting 3s
        function recentColorfunc(){
            setInterval(() =>{
            const currentHex = createHex()
            if(!recentColors.includes(currentHex)){
                recentColors.unshift(currentHex);
                if(recentColors.length>10) recentColors.pop();
                saveToLocalStorage();
                renderLists();
                 }
            }, 3000);
    }

        //Rendering color with buttons in recent and favorite box
        function renderLists() {
            const recentList = document.getElementById("recent-list");
            const favList = document.getElementById("favorite-list");

            recentList.innerHTML = "";
            recentColors.forEach(color => {
                const colorItem = document.createElement("div");
                colorItem.className = "colorItem";
                colorItem.innerHTML = `
                    <div class="colorBox" style="background:${color}"></div>
                    <div class="hexLabel">${color}</div>
                    <div class="colorActions">
                        <button class="addFavBtn" data-color="${color}">❤️</button>
                        <button class="copyColorBtn" data-color="${color}">📋</button>
                        <button class="removeBtn" data-color="${color}">❌</button>
                    </div>
                `;
                recentList.appendChild(colorItem);
            });
        
            favList.innerHTML = "";
            favoriteColors.forEach(color => {
                const colorItem = document.createElement("div");
                colorItem.className = "colorItem";
                colorItem.innerHTML = `
                    <div class="colorBox" style="background:${color}"></div>
                    <div class="hexLabel">${color}</div>
                    <div class="colorActions">
                        <button class="removeBtn" data-color="${color}">❌</button>
                        <button class="copyColorBtn" data-color="${color}">📋</button>
                    </div>
                `;
                favList.appendChild(colorItem);
            });
            
            const items = gsap.utils.toArray(".colorItem");
            gsap.from(items, {
            opacity: 0,
            scale: 0.5,
            y: -20,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
            });

            attachButtonListeners();
}       

        //Changing values of colors using buttons
        function changeValues(state) {
            const adjustment = 1

            if(activeSlider == "r"){
                rVal += state === "up" ? adjustment : -adjustment;
                if(rVal>255){rVal=255};
                if(rVal<0){rVal=0};
            };

            if(activeSlider == "g"){
                gVal += state === "up" ? adjustment : -adjustment;
                if(gVal>255){gVal=255};
                if(gVal<0){gVal=0};
            }

            if(activeSlider == "b"){
                bVal += state === "up" ? adjustment : -adjustment;
                if(bVal>255){bVal=255};
                if(bVal<0){bVal=0};
            }

                slider_1.value = rVal
                slider_2.value = gVal
                slider_3.value = bVal

                createRGB()
                createHex()
                updateSliderDisplay()
                updateBox()
         
        };

        //Copy to Clipboard functionality
        async function copytoClipboard(text, btn) {
            try{
                await navigator.clipboard.writeText(text.textContent);
                btn.textContent = "Copied";
                setTimeout(() => btn.textContent = "Copy", 1500);
            }
            catch (err){
                console.error("Failed to copy", err);
                btn.textContent = "Error";
            }
        };

        //Creating RGB code
        createRGB()
        function createRGB(){
            const R = rVal;
            const G = gVal;
            const B = bVal;
            let rgbV = `rgb(${R}, ${G}, ${B})`;
            rgbCode.textContent = rgbV;

        };

        //Creating HEX code
        createHex()
        function createHex(){
            const hexR = rVal.toString(16).padStart(2, '0');
            const hexG = gVal.toString(16).padStart(2, '0');
            const hexB = bVal.toString(16).padStart(2, '0');

            const finallHex = `#${hexR}${hexG}${hexB}`.toUpperCase();
            hexCode.textContent = finallHex;

            return finallHex;
        };

         
        //Auxiliary function for updating values
        function updateSliderDisplay() {
            slider_1.nextElementSibling.textContent = rVal;
            slider_2.nextElementSibling.textContent = gVal;
            slider_3.nextElementSibling.textContent = bVal;
        };


        //Updating values of sliders
        function updateValues(e){
            activeSlider = e.target.id
            if (activeSlider === "r"){
                rVal = parseInt(e.target.value)
            } 
            if (activeSlider === "g"){
                gVal = parseInt(e.target.value)
            } 
            if (activeSlider === "b"){
                bVal = parseInt(e.target.value)
            } 

            createRGB()
            createHex()
            updateSliderDisplay()
            updateBox()
        };

        //Reseting values of sliders to zero
        function resetColors(){
            rVal = 0
            gVal = 0
            bVal = 0

            slider_1.value = 0
            slider_2.value = 0
            slider_3.value = 0


            slider_1.nextElementSibling.textContent = 0;
            slider_2.nextElementSibling.textContent = 0;
            slider_3.nextElementSibling.textContent = 0;
            
            createRGB()
            createHex()
            updateBox()
        };

        //Updating to current color
        function updateBox(){
            box.style.backgroundColor = `rgb(${rVal}, ${gVal}, ${bVal})`;
        };
        renderLists();
