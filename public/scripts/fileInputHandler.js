const onFormSubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  //   const fileInput = document.getElementById("uploadedFile");
  const progressBar = document.getElementById("upload-progress");
  const formData = new FormData(form);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", form.action);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      progressBar.value = percent;
      progressBar.style.display = "block";
    }
  };

  xhr.onload = () => {
    progressBar.style.display = "none";
    window.location.reload();
  };

  xhr.onerror = () => {
    progressBar.style.display = "none";
  };

  xhr.send(formData);
};

export default onFormSubmit;
