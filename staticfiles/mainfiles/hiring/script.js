document.addEventListener("DOMContentLoaded", async function () {
  const jobListings = document.getElementById("jobListings");

  try {
    const querySnapshot = await getDocs(collection(db, "hiring"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="text-center">${data.title || "NOT DISCLOSED"}</td>
        <td class="text-center">${"₹" + data.stipend || "NOT DISCLOSED"}</td>
        <td class="text-center">${data.role || "NOT DISCLOSED"}</td>
        <td class="text-center">${data.location || "NOT DISCLOSED"}</td>
        <td class="text-center">${data.company_name || "NOT DISCLOSED"}</td>
        <td class="text-center"><a href="${
          data.job_description_doc || "#"
        }">Click Here</a></td>
        <td><button class="applyButton" data-jobid="${
          doc.id
        }">Apply</button></td>
      `;
      jobListings.appendChild(row);
    });
  } catch (error) {
    console.error("Error retrieving job listings:", error);
  }

  if (email) {
    try {
      const appliedJobsRef = doc(db, "jobsapplied", email);
      const docSnap = await getDoc(appliedJobsRef);
      if (docSnap.exists()) {
        const appliedJobs = docSnap.data();

        for (const jobId in appliedJobs) {
          const button = document.querySelector(
            `.applyButton[data-jobid="${jobId}"]`
          );
          if (button) {
            button.textContent = "Applied";
            button.style.backgroundColor = "#45a049";
            button.disabled = true;
          }
        }
      }
    } catch {
      console.log("error");
    }
  }

  // Add event listener for Apply buttons
  const applyButtons = document.querySelectorAll(".applyButton");
  applyButtons.forEach((button) => {
    button.addEventListener("click", applyForJob);
  });

  async function applyForJob(event) {
    const button = event.target;
    const jobId = button.dataset.jobid;

    if (email) {
      try {
        const docRef = doc(db, "jobsapplied", email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          updateDoc(docRef, { [jobId]: true });
          console.log("Job application updated");
        } else {
          await setDoc(docRef, { [jobId]: true });
          console.log("Job application added");
        }

        // Update button properties
        button.textContent = "Applied";
        button.style.backgroundColor = "#45a049";
        button.disabled = true;
      } catch (error) {
        console.error("Error applying for job:", error);
      }

      try {
        const docRef = doc(db, "hiring", jobId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const jobData = docSnap.data();
          const appliedCandidates = jobData.appliedCandidates || [];

          if (!appliedCandidates.includes(email)) {
            appliedCandidates.push(email);
            await updateDoc(docRef, { appliedCandidates });
            console.log("Candidate added to the list of applied candidates");
          } else {
            console.log("Candidate already applied for this job");
          }
        } else {
          console.log("Job document does not exist");
        }
      } catch (error) {
        console.error("Error updating applied candidates list:", error);
      }
    } else {
      alert("You are not logged In. Please login");
    }
  }
});
