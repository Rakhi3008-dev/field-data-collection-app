let projects = ["Project 1", "Project 2"];
let audioChunks = [];
let recorder;

// Add New Project
function addProject() {
  const newProject = prompt("Enter project name:");
  if (newProject) {
    projects.push(newProject);
    const projectSelect = document.getElementById("project");
    const option = document.createElement("option");
    option.value = newProject;
    option.textContent = newProject;
    projectSelect.appendChild(option);
    projectSelect.value = newProject;
  }
}

// Geolocation
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  document.getElementById("latitude").value = position.coords.latitude;
  document.getElementById("longitude").value = position.coords.longitude;
}

// Save Text Note
function saveTextNote() {
  const note = document.getElementById("text-note").value;
  if (note.trim()) {
    const savedNotes = document.getElementById("saved-notes");
    const noteElement = document.createElement("div");
    noteElement.textContent = note;
    savedNotes.appendChild(noteElement);
    document.getElementById("text-note").value = ""; // Clear textarea
    alert("Note saved!");
  } else {
    alert("Please enter a note.");
  }
}

// Photo Preview with Removal Option
document.getElementById("photo-input").addEventListener("change", function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const photoPreview = document.getElementById("photo-preview");
      photoPreview.innerHTML = ""; // Clear previous preview

      const img = document.createElement("img");
      img.src = event.target.result;
      img.style.width = "100%";
      img.style.marginTop = "10px";
      photoPreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
});

// Voice Note Recording with Error Handling
function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = event => audioChunks.push(event.data);
      recorder.start();
      alert("Recording started...");
    })
    .catch(err => alert("Could not start recording: " + err));
}

function stopRecording() {
  if (recorder && recorder.state === "recording") {
    recorder.stop();
    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = document.createElement("audio");
      audio.src = audioUrl;
      audio.controls = true;
      document.getElementById("audio-notes").appendChild(audio);
      audioChunks = []; // Clear for the next recording
      alert("Recording saved!");
    };
  } else {
    alert("No active recording to stop.");
  }
}

// Export All Data as a Single Text File
function exportData() {
  const project = document.getElementById("project").value;
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;
  const notes = Array.from(document.getElementById("saved-notes").children).map(div => div.textContent);
  
  // Get photo data URL (base64)
  let photoData = null;
  const photoInput = document.getElementById("photo-input").files[0];
  if (photoInput) {
    const reader = new FileReader();
    reader.onload = function(event) {
      photoData = event.target.result;
      saveDataFile();  // Proceed to save once photo data is loaded
    };
    reader.readAsDataURL(photoInput);
  } else {
    saveDataFile();  // Proceed to save if no photo is uploaded
  }

  function saveDataFile() {
    const data = {
      project,
      latitude,
      longitude,
      notes,
      photo: photoData,
    };

    const dataString = JSON.stringify(data, null, 2);
    const blob = new Blob([dataString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "field_data.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
}
