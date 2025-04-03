let prompts = document.getElementById("prompt");
let chatContainer = document.getElementById("chatContainer");
let spinner = document.getElementById("spinner");
let imagebtn1 = document.getElementById("imagebtn1");
let imageinput = document.getElementById("imageInput");
// let saveid=document.getElementById("saveid");
let userInput = document.getElementById("userInput");
let responseOutput = document.getElementById("responseOutput");



document.addEventListener("DOMContentLoaded", function() {
    let startButton = document.getElementById("startButton");
    let goToStartButton = document.getElementById("gotostart");
    let startfeatures=document.getElementById("startfeatures");
    let backs=document.getElementById("backs");
    if (startButton) {
        startButton.addEventListener("click", function() {
            window.location.href = "about.html"; 
        });
    }

    if (goToStartButton) {
        goToStartButton.addEventListener("click", function() {
            window.location.href = "chatboat.html"; 
        });
    }

    if (startfeatures) {
        startfeatures.addEventListener("click", function() {
            window.location.href = "about.html"; 
        });
    }
    if (backs) {
        backs.addEventListener("click", function() {
            window.location.href = "chatboat.html"; 
        });
    }
});


const apiurl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyArNw4mbr51ONjgzk3hKA-V9tWqJMTrEpA";
let user = {
    message: null,
    file: null
};
let Savechanges = document.getElementById("Savechanges");
document.addEventListener("DOMContentLoaded", function() {
    let storedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    let chatHistoryHTML = "";

    storedChats.forEach(chat => {
        chatHistoryHTML += `<p><strong>User:</strong> ${chat.userMessage}</p>`;
        chatHistoryHTML += `<p><strong>Bot:</strong> ${chat.aiResponse}</p><hr>`;
    });

    document.getElementById("userInput").innerHTML = chatHistoryHTML;
    document.getElementById("Savechanges").addEventListener("click", function() {
        localStorage.removeItem("storedChat");
        localStorage.removeItem("storedChats");
        localStorage.removeItem("chatHistory");
        document.getElementById("userInput").textContent = "";
        document.getElementById("responseOutput").textContent = "";
    });



});


async function gebrareedresponse() {
    let parts = [];

    if (user.message) {
        parts.push({
            text: user.message
        });
    }
    if (user.file) {
        parts.push({
            inline_data: user.file
        });
    }

    let requestOption = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts
            }]
        })
    };

    try {
        let respo1 = await fetch(apiurl, requestOption);
        let jsonData = await respo1.json();
        console.log("Response:", jsonData);

        if (jsonData.candidates && jsonData.candidates[0] && jsonData.candidates[0].content) {
            let responseText = jsonData.candidates[0].content.parts[0].text;

            // Handle bounding box response format
            if (responseText.includes("bounding box detections")) {
                try {
                    // Extract the JSON array from the response
                    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
                    if (jsonMatch && jsonMatch[1]) {
                        const boxes = JSON.parse(jsonMatch[1]);

                        // Group labels by similarity and remove duplicates
                        const labelMap = {};
                        boxes.forEach(box => {
                            const cleanLabel = box.label.replace(/\n/g, ' ').trim();
                            if (cleanLabel && !labelMap[cleanLabel]) {
                                labelMap[cleanLabel] = true;
                            }
                        });

                        // Create formatted response
                        const uniqueLabels = Object.keys(labelMap);
                        if (uniqueLabels.length > 0) {
                            let formattedResponse = "I detected these concepts in the image:\n\n";
                            formattedResponse += uniqueLabels.map(label => `• ${label}`).join('\n');
                            return formattedResponse;
                        }
                    }
                } catch (e) {
                    console.error("Error formatting bounding boxes:", e);
                }
                return "I found several AI-related concepts in the image.";
            }

            return responseText.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        } else {
            return "I couldn't understand that. Could you try again?";
        }
    } catch (error) {
        console.log(error);
        return "Oops! Something went wrong.";
    }
}

// handle chat responsees
function handlechatResponse(onmessage) {
    user.message = onmessage;

    let userchatcontainer = document.createElement("div");
    userchatcontainer.classList.add("user-chat-box");
    chatContainer.appendChild(userchatcontainer);

    let image1 = document.createElement("img");
    image1.classList.add("image1");
    image1.src = "https://d1tgh8fmlzexmh.cloudfront.net/ccbp-dynamic-webapps/chatbot-boy-img.png";
    userchatcontainer.appendChild(image1);

    let userchatboxes = document.createElement("div");
    userchatboxes.textContent = user.message;
    userchatboxes.classList.add("user-chat-area");
    prompts.value = "";
    userchatcontainer.appendChild(userchatboxes);

    spinner.classList.remove("d-none");

    // ✅ **Scroll Issue Fix**
    setTimeout(() => {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth"
        });
    }, 50);
    let a;
    gebrareedresponse().then(aiResponse => {
        setTimeout(function() {
            let userchatcontainers = document.createElement("div");
            userchatcontainers.classList.add("ai-chat-box");
            chatContainer.appendChild(userchatcontainers);

            let image2 = document.createElement("img");
            image2.classList.add("image2");
            image2.src = "https://d1tgh8fmlzexmh.cloudfront.net/ccbp-dynamic-webapps/chatbot-bot-img.png";
            userchatcontainers.appendChild(image2);
            a = aiResponse;
            let userchatboxes2 = document.createElement("div");
            spinner.classList.add("d-none");
            userchatboxes2.textContent = aiResponse;
            userchatboxes2.classList.add("ai-chat-area");
            userchatcontainers.appendChild(userchatboxes2);

            // ✅ **Ensure Scroll After Bot Response**
            setTimeout(() => {
                chatContainer.scrollTo({
                    top: chatContainer.scrollHeight,
                    behavior: "smooth"
                });
            }, 50);

        }, 2000);
    });

    //  save
    // Create the save button container
    let span = document.createElement("span");
    chatContainer.appendChild(span);

    // Create the save button
    let saveid = document.createElement("button");
    saveid.classList.add("btn", "btn-outline-warning", "ml-2"); // Add Bootstrap styling
    span.appendChild(saveid);

    // Create the save icon
    let i = document.createElement("i");
    i.classList.add("fa-regular", "fa-cloud-arrow-up"); // Correct icon class
    saveid.appendChild(i);

    // Event listener for save button
    saveid.addEventListener("click", function() {
        let storedChats = JSON.parse(localStorage.getItem("chatHistory")) || []; // Get existing chat history

        if (user.message && a) {
            storedChats.push({
                userMessage: user.message,
                aiResponse: a
            });
            localStorage.setItem("chatHistory", JSON.stringify(storedChats)); // Save updated chat history
        }
    });




    // Function to load saved chats when the modal opens
    $('#exampleModal').on('show.bs.modal', function() {
        let savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
        let chatHistoryHTML = "";

        savedChats.forEach(chat => {
            chatHistoryHTML += `<p><strong>User:</strong> ${chat.userMessage}</p>`;
            chatHistoryHTML += `<p><strong>Bot:</strong> ${chat.aiResponse}</p><hr>`;
        });

        document.getElementById("userInput").innerHTML = chatHistoryHTML;
    });




}

// event listener
prompts.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && prompts.value.trim() !== "") {
        handlechatResponse(prompts.value.trim());
    }
});


// Add a div for image description after image upload
let imageDescriptionInput = null;

imageinput.addEventListener("change", function(event) {
    const file = imageinput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        let base64 = e.target.result.split(",")[1].trim(); // ✅ Trim base64
        console.log("File Loaded:", file.name);

        user.file = {
            mime_type: file.type,
            data: base64
        };

        // Create an input for the user to describe the image
        if (imageDescriptionInput) {
            imageDescriptionInput.remove(); // Remove any previous input fields
        }

        imageDescriptionInput = document.createElement("input");
        imageDescriptionInput.type = "text";
        imageDescriptionInput.classList.add("image-description-input");
        imageDescriptionInput.placeholder = "Write something about this image...";

        chatContainer.appendChild(imageDescriptionInput);
        imageDescriptionInput.focus(); // Focus the input so the user can start typing

        // Once the user writes something and presses Enter, send it with the image
        imageDescriptionInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter" && imageDescriptionInput.value.trim() !== "") {
                // Combine image description with the file info
                handlechatResponse("📤 Image uploaded: " + file.name + "\n" + imageDescriptionInput.value.trim());
                imageDescriptionInput.remove(); // Remove input after submission
            }
        });
    };
    reader.readAsDataURL(file);
});


// click the image button
imagebtn1.addEventListener("click", function(event) {
    imageinput.click();
});
// Reference to the voice input button
let voiceInputBtn = document.getElementById("voiceInputBtn");

// Add event listener to activate voice input
voiceInputBtn.addEventListener("click", function() {
    startVoiceRecognition();
});

// Voice recognition function
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your browser does not support speech recognition.");
        return;
    }

    let recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Set language to English

    recognition.onstart = () => {
        console.log("Listening...");
    };

    recognition.onspeechend = () => {
        console.log("Stopped listening.");
        recognition.stop();
    };

    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript;
        prompts.value = transcript; // Set the transcript in the input field
        handlechatResponse(transcript); // Use the existing function to handle the response
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.start();
}




// save button
// <span> <button id="saveid"> <i class="fa-regular fa-cloud-arrow-up"></i></button></span>