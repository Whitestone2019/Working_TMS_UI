import axios from "axios";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
 const API_URL = "http://192.168.0.21:8085/TMS/api";
 //const API_URL = "http://localhost:8080/api";

console.log("API URL:", API_URL);

export const createAccount = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};




export const sendOtp = async (trngId) => {
  try {
    const response = await axios.post(`${API_URL}/users/send-otp`, { trngId });
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/users/verify-otp`, data);
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const storeUserDetails = async () => {
  const data = [
    {
      "userid": "2019Ws10019",
      "trngid": "Ws10111",
      "password": "$2a$10$uuitzF5IfvDByIhsOE5TieovEOJ6LyJJppMgaBjbECZBAaeLj0NnK",
      "username": "BB",
      "firstname": "BB",
      "lastname": "A",
      "emailid": "abs@gmail.bom",
      "phonenumber": "9787255965",
      "roleId": "R001",

    },
    {
      "userid": "2019wss123",
      "trngid": "wss123",
      "password": "$2a$10$2Z3nNVR5uGKJE33jSK9yreGFDwvktrzFuWwLb95IpQhex5eLOAk8e",
      "username": "wss123",
      "firstname": "BBB",
      "lastname": "A",
      "emailid": "wwm@gmail.com",
      "phonenumber": "987635616",
      "roleId": "R001",
    },
    {
      "userid": "2019WS1155",
      "trngid": "WS1155",
      "password": "$2a$10$G7szEGln2OiGaqVA0SnUpu0mN7EeaS3JpLpC83OSD35sYSholZL3C",
      "username": null,
      "firstname": "Aswathi",
      "lastname": null,
      "emailid": "aswathi.ravindran@whitestones.co.in",
      "phonenumber": "09787255964",
      "roleId": "R001",
    },
    {
      "userid": "2019WS1122",
      "trngid": "WS1122",
      "password": "demo@123",
      "username": "Arunmaran",
      "firstname": "Arunmaran",
      "lastname": "Murugasen",
      "emailid": "laxmi.shukla@whitestones.co.in",
      "phonenumber": "9345287327",
      "roleId": "R005",
    },
    {
      "userid": "2019WS10018",
      "trngid": "WS10018",
      "password": "$2a$10$qECY9SHPCdM1cA16TuC9.eDKw7GrlLOCEoE27iJuP9HlAEYFftVOm",
      "username": "Britto",
      "firstname": "Brit",
      "lastname": "A",
      "emailid": "abs@gmail.bom",
      "phonenumber": "02345678444",
      "roleId": "R001",
    },
    {
      "userid": "2019WS10009",
      "trngid": "WS10009",
      "password": "$2a$10$dCrmV.cSDhplIYnAvyNUR.XNiUn9d/pmW87uGj3AT79BN6dur8bum",
      "username": "ANBU",
      "firstname": "ANBU",
      "lastname": "S",
      "emailid": "anbarasan.sekar@whitestones.in",
      "phonenumber": "9788313457",
      "roleId": "R001",
    }
  ]
  try {
    const response = await axios.post(`${API_URL}/users/bulk-create`, data);
    // return response.data;
  } catch (error) {
    console.error("Error storing user details:", error);
    throw error;
  }
};


// const data = [
//   {
//     "userid": "2019Ws10019",
//     "trngid": "Ws10111",
//     "password": "$2a$10$uuitzF5IfvDByIhsOE5TieovEOJ6LyJJppMgaBjbECZBAaeLj0NnK",
//     "username": "BB",
//     "firstname": "BB",
//     "lastname": "A",
//     "emailid": "abs@gmail.bom",
//     "phonenumber": "9787255965",
//     "roleId": "R001",

//   },
//   {
//     "userid": "2019wss123",
//     "trngid": "wss123",
//     "password": "$2a$10$2Z3nNVR5uGKJE33jSK9yreGFDwvktrzFuWwLb95IpQhex5eLOAk8e",
//     "username": "wss123",
//     "firstname": "BBB",
//     "lastname": "A",
//     "emailid": "wwm@gmail.com",
//     "phonenumber": "987635616",
//     "roleId": "R001",
//   },
//   {
//     "userid": "2019WS1155",
//     "trngid": "WS1155",
//     "password": "$2a$10$G7szEGln2OiGaqVA0SnUpu0mN7EeaS3JpLpC83OSD35sYSholZL3C",
//     "username": null,
//     "firstname": "Aswathi",
//     "lastname": null,
//     "emailid": "aswathi.ravindran@whitestones.co.in",
//     "phonenumber": "09787255964",
//     "roleId": "R001",
//   },
//   {
//     "userid": "2019WS1122",
//     "trngid": "WS1122",
//     "password": "$2a$10$VVz9JDazDVsGjfj3L5AzYeWPs1LCvU/HT6kcqUr55TRHVGJguIzGa",
//     "username": "Arunmaran",
//     "firstname": "Arunmaran",
//     "lastname": "Murugasen",
//     "emailid": "arunmaran.murugesan@whitestones.co.in",
//     "phonenumber": "9345287327",
//     "roleId": "R001",
//   },
//   {
//     "userid": "2019WS10018",
//     "trngid": "WS10018",
//     "password": "$2a$10$qECY9SHPCdM1cA16TuC9.eDKw7GrlLOCEoE27iJuP9HlAEYFftVOm",
//     "username": "Britto",
//     "firstname": "Brit",
//     "lastname": "A",
//     "emailid": "abs@gmail.bom",
//     "phonenumber": "02345678444",
//     "roleId": "R001",
//   },
//   {
//     "userid": "2019WS10009",
//     "trngid": "WS10009",
//     "password": "$2a$10$dCrmV.cSDhplIYnAvyNUR.XNiUn9d/pmW87uGj3AT79BN6dur8bum",
//     "username": "ANBU",
//     "firstname": "ANBU",
//     "lastname": "S",
//     "emailid": "anbarasan.sekar@whitestones.in",
//     "phonenumber": "9788313457",
//     "roleId": "R001",
//   }
// ]
// // const alreadyCreated = localStorage.getItem("bulkUsersCreated");

// // if (!alreadyCreated) {
// // console.log("ecekfoks")
// //   const res = await storeUserDetails(data);
// //   console.log("ahd"+res)
// //   localStorage.setItem("bulkUsersCreated", "true");
// // }
// export const storeDetails = async () =>{}


export const fetchAllTrainees = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching trainees:", error);
    throw error;
  }
};


export const createAssessment = async (empId, data) => {
  try {
    const response = await axios.post(`${API_URL}/assessments/create/${empId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating assessment:", error);
    throw error;
  }
};

  export const updateAssessment = async (assessmentId, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/assessments/update/${assessmentId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error updating assessment:", error);
      throw error;
    }
  };
//testing
export const fetchAllAssessments = async () => {
  try {
    const response = await axios.get(`${API_URL}/assessments/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw error;
  }
};




export const fetchAssessmentsByTrainee = async (empId) => {
  try {
    const response = await axios.get(`${API_URL}/assessments/trainee/${empId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments for trainee:", error);
    throw error;
  }
};



export const fetchAllTraineeSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching trainee summary:", error);
    throw error;
  }
};

export const fetchAllTraineeSummaryAdmin = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/all-trainee/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching trainee summary:", error);
    throw error;
  }
}


// export const getAllTrainers = async () => {
//   try {
//     const res = await axios.get(`${API_URL}/trainers/all`);
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching trainers:", error);
//     throw error;
//   }
// };


export const getAllTrainers = async () => {
  try {
    const res = await axios.get(`${API_URL}/users/manager/all`);
    console.log("Trainers fetched:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching trainers:", error);
    throw error;
  }
};



// export const addTrainer = async (data) => {
//   try {
//     const res = await axios.post(`${API_URL}/trainers/add`, data);
//     return res.data;
//   } catch (error) {
//     console.error("Error adding trainer:", error);
//     throw error;
//   }
// };

// export const createSchedule = async (trainerId, data) => {
//   try {
//     const res = await axios.post(`${API_URL}/schedule/create/${trainerId}`, data);
//     return res.data;
//   } catch (error) {
//     console.error("Error creating schedule:", error);
//     throw error;
//   }
// };

  export const createSchedule = async (trainerIds, data) => {
  try {
    // ensure array
    const idsArray = Array.isArray(trainerIds) ? trainerIds : [trainerIds];

    const res = await axios.post(
      `${API_URL}/schedule/create`,
      data,
      {
        params: {
          trainerIds: idsArray   //  axios automatically ?trainerIds=EMP1&trainerIds=EMP2 banayega
        }
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error creating schedule:", error);
    throw error;
  }
};
export const assignTrainees = async (scheduleId, traineeList) => {
  try {
    const res = await axios.post(`${API_URL}/schedule/assign/${scheduleId}`, traineeList);
    return res.data;
  } catch (error) {
    console.error("Error assigning trainees:", error);
    throw error;
  }
};

export const getAllSchedules = async () => {
  try {
    const res = await axios.get(`${API_URL}/schedule/all`);
    return res.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

export const uploadSyllabusAPI = async (formData) => {
  // const res = await axios.post(`${API_URL}/syllabus/add`, formData);
  const res = await axios.post(`${API_URL}/syllabus/add`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

export const getAllSyllabusAPI = async () => {
  const res = await axios.get(`${API_URL}/syllabus/all`);
  return res;
};

export const updateSyllabusAPI = async (id, formData) => {
  const res = await axios.put(`${API_URL}/syllabus/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};



export const fetchAllSchedules = async () => {
  try {
    const response = await axios.get(`${API_URL}/schedule/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};


export const getSyllabusByIdAPI = async (id) => {
  //return await axios.get(`${API_URL}/syllabus/` + id);
  try {
    const response = axios.get(`${API_URL}/syllabus/` + id);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};





// export const updateStepProgress = async (empId, stepId, progress) => {
//   const payload = { empId, stepId, progress };
//   const response = await fetch("http://localhost:8080/api/progress/update-step", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) throw new Error("Failed to update step progress");
//   return await response.json(); // contains overallProgress
// };


// export const fetchSteps = async (empId) => {
//   const res = await axios.get(`${API_URL}/steps/${empId}`);
//   return res.data;
// };

export const updateStepProgress = async (empId, stepId, progress, durationTime) => {
  const res = await axios.post(`${API_URL}/progress/update-step`, {
    empId,
    stepId,
    progress,
    durationTime
  });
  return res.data;
};

export const getOverallProgressTime = async (empId) => {
  const response = await axios.get(`${API_URL}/progress/overall-time?empId=${empId}`);
  return response.data.overallTimeSeconds;
};


export const fetchUserByEmpId = async (empId) => {
  try {
    const res = await axios.get(`${API_URL}/users/${empId}`);

    // API response format:
    // { status: 200, success: true, message: "...", data: {...user} }

    return res.data.data; // return actual user object
  } catch (error) {
    console.error("Error fetching user by empId:", error);
    throw error;
  }
};

// export const fetchInterviewScheduleByEmpId = async (empId) => {
//   try {
//     const res = await axios.get(`${API_URL}/schedule/user/${empId}`);
//     return res.data; // return list of interviews
//   } catch (error) {
//     console.error("Error fetching interview schedule:", error);
//     throw error;
//   }
// };

export const fetchInterviewScheduleByEmpId = async (empId) => {

  try {
    const response = await axios.get(`${API_URL}/schedule/user-interview/${empId}`);

    // Pure accurate data return karenge
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

export const fetchStepByEmpId = async (empId) => {
  try {
    const response = await axios.get(
      `${API_URL}/step-progress/emp/${empId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};


export const startSubTopic = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/step-progress/start`, formData);
    return response.data;
  } catch (error) {
    console.error("Error starting subtopic:", error);
    throw error;
  }
}


export const completeSubTopic = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/step-progress/complete`, formData);
    return response.data;
  } catch (error) {
    console.error("Error completing subtopic:", error);
    throw error;
  }
}

export const fetchCompletedSubTopics = async () => {
  try {
    const response = await axios.get(`${API_URL}/syllabus/all-progress`);
    return response;
  } catch (error) {
    console.error("Error fetching completed subtopics:", error);
    throw error;
  }
}


// export const approveSubTopicAPI = async (progressId) => {
//   try {
//     const response = await fetch(
//       `${API_URL}/step-progress/approve/${progressId}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to approve subtopic");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Approve API error:", error);
//     throw error;
//   }
// };

export const approveSubTopicAPI = async (progressId, review = "") => {
  const url = review
    ? `${API_URL}/step-progress/approve/${progressId}?review=${encodeURIComponent(review)}`
    : `${API_URL}/step-progress/approve/${progressId}`;

  const response = await fetch(url, { method: "PUT" });

  if (!response.ok) {
    throw new Error("Failed to approve subtopic");
  }

  return response.json();
};


// export const rejectSubTopicAPI = async (progressId, review) => {
//   try {
//     const response = await fetch(
//       `${API_URL}/step-progress/reject/${progressId}?review=${encodeURIComponent(review)}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to reject subtopic");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Reject API error:", error);
//     throw error;
//   }
// };

export const rejectSubTopicAPI = async (progressId, review) => {
  if (!review || review.trim() === "") {
    throw new Error("Review is required for rejection");
  }

  const response = await fetch(
    `${API_URL}/step-progress/reject/${progressId}?review=${encodeURIComponent(review)}`,
    { method: "PUT" }
  );

  if (!response.ok) {
    throw new Error("Failed to reject subtopic");
  }

  return response.json();
};


export const fetchSyllabusProgressByEmpId = async (empid) => {
  try {
    const response = await axios.get(
      `${API_URL}/syllabus/all-progress/${empid}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching syllabus progress by empid:", error);
    throw error;
  }
};


// export const fetchSyllabusProgressByEmpId = async (empid) => {
//   try {
//     const response = await axios.get(
//       `${API_URL}/syllabus/user/${empid}`
//     );
//     return response;
//   } catch (error) {
//     console.error("Error fetching syllabus progress by empid:", error);
//     throw error;
//   }
// };





const fetchSyllabusProgress = async (empId) => {
  const res = await fetch(
    `${API_URL}/syllabus/all-progress/${empId}`
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Backend error:", text);
    throw new Error("Failed to fetch syllabus progress");
  }

  return await res.json(); //  guaranteed JSON
};


export const fetchTraineeById = async (traineeId) => {
  const res = await fetch(
    `${API_URL}/assessments/trainee/${traineeId}`
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Backend error:", text);
    throw new Error("Failed to fetch trainee details");
  }

  return await res.json(); //  guaranteed JSON
};



export const updateInterviewSchedule = async (scheduleId, data) => {
  try {
    const res = await axios.put(`${API_URL}/schedule/update/${scheduleId}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error;
  }
};

export const deleteInterviewSchedule = async (scheduleId) => {
  try {
    const res = await axios.delete(`${API_URL}/schedule/delete/${scheduleId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
};

export const fetchTraineesByManagerId = async (managerId) => {
  try {
    const response = await axios.get(
      `${API_URL}/users/manager/${managerId}`
    );
    return response.data; // Returns ApiResponse object
  } catch (error) {
    console.error("Error fetching trainees by manager:", error);
    throw error;
  }
};

// 2. Get Trainee Summary for a Manager
export const fetchTraineeSummaryByManager = async (managerUserId) => {
  try {
    const response = await axios.get(
      `${API_URL}/users/${managerUserId}/trainee-summary`
    );
    return response.data; // Returns ApiResponse object
  } catch (error) {
    console.error("Error fetching trainee summary:", error);
    throw error;
  }
};


export const deleteSubTopicAPI = async (subTopicId) => {
  return axios.delete(`${API_URL}/syllabus/subtopic/${subTopicId}`);
};

// Delete entire Syllabus by ID
export const deleteSyllabusAPI = async (syllabusId) => {
  return axios.delete(`${API_URL}/syllabus/bulk-delete/${syllabusId}`);
};


// Create Department
export const createDepartment = (department) => {
  return axios.post(`${API_URL}/departments`, department);
};

// Get all departments (NOT by manager)
export const getAllDepartments = () => {
  return axios.get(`${API_URL}/departments`);
};

// Get departments by manager
export const getDepartmentsByManager = (managerId) => {
  return axios.get(`${API_URL}/departments/manager/${managerId}`);
};

// Delete department
export const deleteDepartment = (id) => {
  return axios.delete(`${API_URL}/departments/${id}`);
};

// ===== Trainee Department APIs =====
export const getTraineeDepartments = (traineeId) =>
  axios.get(`${API_URL}/trainee-departments/${traineeId}`);

export const assignDepartmentToTrainee = (traineeId, deptId) =>
  axios.post(`${API_URL}/trainees/${traineeId}/departments/${deptId}`);

export const removeDepartmentFromTrainee = (traineeId, deptId) =>
  axios.delete(`${API_URL}/trainees/${traineeId}/departments/${deptId}`);


export const updateDepartment = async (id, payload) => {
  try {
    const response = await axios.put(`${API_URL}/departments/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error("Error updating department");
  }
  }

  
  export const fetchAllDepartments = async () => {
  try {
    const response = await axios.get(`${API_URL}/departments/departments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
};
  
export const fetchAllRoles = () => {
  return axios.get(`${API_URL}/roles`);
};

// ================= TRAINEE CRUD =================
export const addTrainee = (data) => {
  return axios.post(`${API_URL}/users/addtrainees`, data);
};

export const updateTrainee = (trngid, data) => {
  return axios.put(`${API_URL}/users/addtrainee/${trngid}`, data);
};

export const deleteTraineeById = (trngid) => {
  return axios.delete(`${API_URL}/users/delete/${trngid}`);
};

export const getTraineeById = (trngid) => {
  return axios.get(`${API_URL}/users/addtrainee/${trngid}`);
};

// ================= ASSIGN DEPARTMENT =================
export const updateTraineeDepartments = (traineeId, deptIds) => {
  return axios.put(
    `${API_URL}/trainee-departments/${traineeId}`,
    deptIds
  );
};

export const fetchCompletedSubTopicsByManager = async (managerId) => {
  try {
    const response = await axios.get(
      `${API_URL}/syllabus/syllabus-progress/${managerId}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching syllabus progress:", error);
    throw error;
  }
};


// ================= TRAINING FEEDBACK APIs =================

// export const submitTraineeFeedback = async (syllabusId, userId, feedback) => {
//   const response = await fetch(
//     `${process.env.REACT_APP_API_URL}/training/trainee-feedback?syllabusId=${syllabusId}&userId=${userId}&feedback=${encodeURIComponent(feedback)}`,
//     {
//       method: "POST",
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to submit feedback");
//   }

//   return response.text();
// };

// export const submitTrainerRemark = async (syllabusId, userId, remark) => {
//   const response = await fetch(
//     `${process.env.REACT_APP_API_URL}/training/trainer-remark?syllabusId=${syllabusId}&userId=${userId}&remark=${encodeURIComponent(remark)}`,
//     {
//       method: "POST",
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to submit trainer remark");
//   }

//   return response.text();
// };

// export const submitManagerAssessment = async (syllabusId, userId, assessment) => {
//   const response = await fetch(
//     `${process.env.REACT_APP_API_URL}/training/manager-assessment?syllabusId=${syllabusId}&userId=${userId}&assessment=${encodeURIComponent(assessment)}`,
//     {
//       method: "POST",
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to submit manager assessment");
//   }

//   return response.text();
// };



export const fetchSyllabusByTrainer = async (trainerId) => {
  try {
    const response = await axios.get(`${API_URL}/syllabus/trainer/${trainerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching syllabus for trainer ${trainerId}:`, error);
    return [];
  }
};


// // ================= TRAINER SUBMIT =================
// export const submitTrainerFeedbackAPI = async (
//   trngid,
//   syllabusId,
//   feedback
// ) => {
//   try {
//     const response = await axios.post(
//       `${API_URL}/feedback/trainer`,
//       null,
//       {
//         params: {
//           trngid,
//           syllabusId,
//           feedback,
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Trainer feedback submit error:", error);
//     throw error;
//   }
// };

// ================= TRAINEE SUBMIT =================
export const submitTraineeFeedbackAPI = async (
  traineeId,
  trainerId,
  syllabusId,
  feedback
) => {
  try {
    console.log("Trainee Submit:", traineeId, trainerId, syllabusId, feedback);

    const response = await axios.post(
      `${API_URL}/feedback/trainee`,
      null,
      {
        params: {
          traineeId,
          trainerId,
          syllabusId,
          feedback,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Trainee feedback submit error:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Full Error:", error);
    throw error;
  }
};

// ================= TRAINER SUBMIT =================
export const submitTrainerFeedbackAPI = async (
  traineeId,
  trainerId,
  syllabusId,
  feedback
) => {
  try {
    console.log("Trainer Submit:", traineeId, trainerId, syllabusId, feedback);

    const response = await axios.post(
      `${API_URL}/feedback/trainer`,
      null,
      {
        params: {
          traineeId,
          trainerId,
          syllabusId,
          feedback,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Trainer feedback submit error:", error.response?.data);
    console.error("Status:", error.response?.status);
    console.error("Full Error:", error);
    throw error;
  }
};


// ================= GET FEEDBACK =================
export const getSyllabusFeedbackAPI = async (
  traineeId,
  trainerId,
  syllabusId
) => {
  try {
    const response = await axios.get(
      `${API_URL}/feedback/data`,
      {
        params: {
          traineeId,
          trainerId,
          syllabusId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Get feedback error:", error.response?.data);
    console.error("Status:", error.response?.status);
    throw error;
  }
};


export const fetchAssignedSyllabusWithFeedbackForAdmin = async (
  traineeId,
  managerId
) => {
  try {
    const response = await axios.get(`${API_URL}/feedback/assigned`, {
      params: {
        traineeId,
        managerId,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching syllabus feedback:", error);
    throw error;
  }
};


export const fetchAssignedSyllabus = async (traineeId) => {
  try {
    const response = await axios.get(
      `${API_URL}/feedback/assigned-syllabus`,
      {
        params: { traineeId },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assigned syllabus:", error);
    throw error;
  }
};

export const fetchFeedbackBySyllabusForManager = async (traineeId, syllabusId) => {
  const response = await axios.get(
    `${API_URL}/feedback/trainee-feedback-by-syllabus`,
    {
      params: {
        traineeId: traineeId,
        syllabusId: syllabusId
      }
    }
  );

  return response.data;
};



export const fetchAllDelays = () => axios.get(`${API_URL}/dashboard/delays`);
export const fetchTraineeDelays = (traineeId) =>
  axios.get(`${API_URL}/dashboard/delays/${traineeId}`);

export const fetchManagerDelays = (managerId) =>
  axios.get(`${API_URL}/dashboard/manager-delays/${managerId}`);


/* ---------------- CREATE ---------------- */
export const createAssessmentforTest = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/assessment/test/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating assessment:", error);
    throw error;
  }
};

/* ---------------- GET ALL ---------------- */
export const getAllAssessmentsforTest = async () => {
  try {
    const response = await axios.get(`${API_URL}/assessment/test/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw error;
  }
};

/* ---------------- GET BY ID ---------------- */
export const getAssessmentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/assessment/test/assessment/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assessment by id:", error);
    throw error;
  }
};

/* ---------------- UPDATE ---------------- */
export const updateAssessmentforTest = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/assessment/test/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating assessment:", error);
    throw error;
  }
};

/* ---------------- DELETE ---------------- */
export const deleteAssessmentApiforTest = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/assessment/test/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting assessment:", error);
    throw error;
  }
};

/* ---------------- GET BY DEPARTMENT (single) ---------------- */
export const getTraineeAssessmentsforTest = async (departmentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/assessment/test/assessments/${departmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching by department:", error);
    throw error;
  }
};

/* ---------------- GET BY MULTIPLE DEPARTMENTS ---------------- */
export const getAssessmentsByDepartments = async (departmentIds) => {
  try {
    const response = await axios.get(
      `${API_URL}/assessment/test/assessments`,
      {
        params: { departmentIds } // array send hoga
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching by departments:", error);
    throw error;
  }
};

/* ---------------- DEPARTMENTS (AGAR API HAI) ---------------- */
// export const checkAssessmentSubmitted = async (assessmentId, traineeId) => {
//   try {
//     const response = await axios.get(`${API_URL}/assessment/is-submitted`, {
//       params: {
//         assessmentId,
//         traineeId
//       }
//     });

//     return response.data; // true / false return karega
//   } catch (error) {
//     console.error("Error checking submitted status:", error);
//     throw error;
//   }
// };

// export const submitAssessment = async (assessmentId, payload) => {
//   try {
//     const response = await axios.post(
//       `${API_URL}/assessment/submit/${assessmentId}`,
//       payload
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error submitting assessment:", error);
//     throw error;
//   }
// };


export const getDepartmentsWithSyllabus = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/departments/with-syllabus`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching departments with syllabus:", error);
    throw error;
  }
};

export const updateAssessmentApiforTest = async (id, data) => {
  return axios.put(`${API_URL}/assessment/test/update/${id}`, data);
};

export const getTraineeAssessmentsforTestTrainee = async (traineeId, departmentIds) => {
  const res = await axios.get(
    `${API_URL}/assessment/test/trainee/${traineeId}`,
    {
      params: { departmentIds } //  auto handles array
    }
  );
  return res.data;
};

export const getFeedbackBySyllabus = async (traineeId, syllabusId) => {
  try {
    const response = await axios.get(`${API_URL}/feedback-by-syllabus`, {
      params: {
        traineeId,
        syllabusId
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching feedback by syllabus:", error);
    throw error;
  }
};

export const submitAssessment = async (assessmentId, payload) => {
  return axios.post(
    `${API_URL}/assessmenttest/submit/${assessmentId}`,
    payload
  );
};

export const checkAssessmentAttempt = async (assessmentId, traineeId) => {
  return await axios.get(
    `${API_URL}/assessmenttest/assessment/check/${assessmentId}/${traineeId}`
  );
};


export const getAssessmentTest = (assessmentId) => {
  return axios.get(`${API_URL}/assessment/test/${assessmentId}`);
};

export const getEvaluationByAttemptId = (attemptId) => {
  return axios.get(
    `${API_URL}/assessmenttestcheck/evaluation/${attemptId}`
  );
};

//  SUBMIT / UPDATE Evaluation
export const submitEvaluation = (attemptId, payload) => {
  return axios.post(
    `${API_URL}/assessmenttestcheck/submit-evaluation/${attemptId}`,
    payload
  );
};

export const getAssessmentsByTrainee = (traineeId) => {
  return axios.get(
    `${API_URL}/assessmenttest/trainee/${traineeId}/assessments`
  );
};

//  Get result (marks + evaluated status)
export const getResultByTraineeAndAssessment = (traineeId, assessmentId) => {
  return axios.get(
    `${API_URL}/assessmenttestcheck/result`,
    {
      params: {
        traineeId,
        assessmentId,
      },
    }
  );
};

export const fetchTraineeReport = async (traineeId) => {
  try {
    const res = await axios.get(`${API_URL}/assessmenttest/report/${traineeId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching trainee report:", error);
    return null;
  }
};

export const getAssessmentSummary = async (userId, departmentIds = []) => {
  try {
    const res = await axios.get(
      `${API_URL}/assessment/test/assessment/summary/${userId}`,
      {
        params: {
          departmentIds: departmentIds.length ? departmentIds : [1] 
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching assessment summary:", error);
    throw error;
  }
};

export const getSyllabusById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/syllabus/${id}`);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getTraineeAttendance = async (traineeId) => {
  try {
    const res = await axios.get(
      `http://192.168.0.21:8088/HRMS/trainee/attendance/${traineeId}`
    );
    return res.data;
  } catch (error) {
    console.error("Attendance API Error:", error);
    throw error;
  }
};

// export const getAssessmentSummary = async (userId, departmentIds) => {
//   try {
//     const res = await axios.get(
//       `${API_URL}/assessment/test/assessment/summary/${userId}`,
//       {
//         params: {
//           departmentIds // array pass kar sakte ho directly
//         }
//       }
//     );
//     return res.data;
//   } catch (error) {
//     console.error("Error fetching assessment summary:", error);
//     throw error;
//   }
// };


// export const getEvaluationByAttemptId = async (attemptId) => {
//   try {
//     const response = await fetch(`${API_URL}/assessmenttestcheck/evaluation/${attemptId}`);

//     if (!response.ok) {
//       throw new Error("Failed to fetch evaluation data");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error in getEvaluationByAttemptId:", error);
//     throw error;
//   }
// };

// export const submitEvaluation = async (attemptId, payload) => {
//   try {
//     const response = await fetch(
//       `${API_URL}/assessmenttestcheck/submit-evaluation/${attemptId}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to submit evaluation");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error in submitEvaluation:", error);
//     throw error;
//   }
// };