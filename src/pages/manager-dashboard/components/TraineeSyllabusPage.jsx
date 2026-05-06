import React, { useEffect, useState } from "react";
import {
  fetchAssignedSyllabus,
  fetchFeedbackBySyllabusForManager
} from "../../../api_service";

const TraineeSyllabusPage = ({ traineeId,traineeName, onClose }) => {

  const [syllabusList, setSyllabusList] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
const privilegeRoles = ["CEO", "CTO", "HR","PM"];
  useEffect(() => {
    const loadSyllabus = async () => {
      try {
        const data = await fetchAssignedSyllabus(traineeId);
        setSyllabusList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading syllabus", err);
        setSyllabusList([]);
      }
    };

    if (traineeId) loadSyllabus();
  }, [traineeId]);

  const roleName = sessionStorage.getItem("roleName");

  const handleSelectSyllabus = async (syllabusId) => {
    try {
      setSelectedSyllabus(syllabusId);

      const feedback = await fetchFeedbackBySyllabusForManager(
        traineeId,
        syllabusId
      );

      setFeedbackData(Array.isArray(feedback) ? feedback : []);
    } catch (err) {
      console.error("Error fetching feedback", err);
      setFeedbackData([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[950px] h-[550px] rounded-2xl shadow-2xl flex overflow-hidden relative">

        {/*  CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-500 hover:text-red-500 text-2xl font-bold"
        >
          ×
        </button>

        {/* LEFT SIDE */}
        <div className="w-1/3 bg-gray-100 p-5 overflow-y-auto border-r">
        <h2 className="text-lg font-semibold mb-2">
  {traineeName}
</h2>


          <h2 className="text-lg font-semibold mb-4">
            Assigned Syllabus
          </h2>

          {syllabusList?.length > 0 ? (
            syllabusList.map((item) => (
              <div
                key={item.syllabusId}
                onClick={() => handleSelectSyllabus(item.syllabusId)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200
                ${
                  selectedSyllabus === item.syllabusId
                    ? "bg-blue-500 text-white shadow"
                    : "bg-white hover:bg-blue-100"
                }`}
              >
                {item.syllabusName}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No syllabus assigned</p>
          )}
        </div>

       
       {/* RIGHT SIDE */}
<div className="w-2/3 p-8 overflow-y-auto">
  {selectedSyllabus ? (
    <>
      <h3 className="text-2xl font-semibold mb-6">
        Feedback Details
      </h3>

      {feedbackData.length > 0 ? (
        feedbackData.map((item, index) => (
          <div key={index} className="mb-8 border-b pb-6">

            {/* Trainee Feedback */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700">
                Trainee Feedback
              </h4>
              <p className="bg-gray-50 p-4 rounded-lg mt-2 border">
                {item.traineeFeedbackGiven
                  ? item.traineeFeedback
                  : "Trainee feedback not given yet"}
              </p>
            </div>

            {/*  Trainer Name */}
            {/* <div className="mb-4">
              <h4 className="font-medium text-gray-700">
                Trainer Name
              </h4>
              <p className="bg-gray-50 p-4 rounded-lg mt-2 border">
                {item.trainerName}
              </p>
            </div> */}

            {/*  EXTRA FIELD ONLY FOR CEO */}
            {privilegeRoles.includes(roleName) && (
              <div>
                <h4 className="font-medium text-gray-700">
                  Trainer Feedback
                </h4>
                <p className="bg-blue-50 p-4 rounded-lg mt-2 border">
                  {item.trainerFeedbackGiven
                    ? item.trainerFeedback
                    : "Trainer feedback not given yet"}
                </p>
              </div>
            )}

          </div>
        ))
      ) : (
        <p className="text-gray-500">
          No feedback available for this syllabus
        </p>
      )}
    </>
  ) : (
    <div className="flex items-center justify-center h-full text-gray-500">
      Select a syllabus to view feedback
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default TraineeSyllabusPage;

