const onFormSubmit = (e, popupDOM) => {
  // e.preventDefault();
  const form = e.target;

  const progressBar = document.getElementById("upload-progress");
  const formData = new FormData(form);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", form.action);

  xhr.upload.onprogress = (event) => {
    // Disable inputs and submit button during submission
    // Object.values(popupDOM.inputs).forEach((input) => {
    //   input.setAttribute("readonly", true);
    //   input.setAttribute("tabindex", "-1");
    //   input.disabled = true;
    // });
    // popupDOM.submitButton.disabled = true;
    // popupDOM.submitButton.setAttribute("aria-disabled", "true");

    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      progressBar.value = percent;
      progressBar.style.display = "block";
    }
  };

  xhr.onload = () => {
    progressBar.style.display = "none";
  };

  xhr.onerror = () => {
    progressBar.style.display = "none";
    alert("An error occurred during upload.");
    // Re-enable inputs and button
    Object.values(popupDOM.inputs).forEach((input) => {
      input.removeAttribute("readonly");
      input.removeAttribute("tabindex");
      input.disabled = false;
    });
    popupDOM.submitButton.disabled = false;
    popupDOM.submitButton.removeAttribute("aria-disabled");
  };

  xhr.send(formData);
};

export default onFormSubmit;
