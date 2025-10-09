import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const CreateSessionForm = () => {
    const [formData, setFormData] = useState({
        role: "",
        experience: "",
        topicsToFocus: "",
        description: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = (key, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    const handelCreateSession = async (e) => {
        e.preventDefault();
        // API call to create a new session
        const { role, experience, topicsToFocus } = formData;

        if (!role || !experience || !topicsToFocus) {
            setError("Please fill all required fields");
            return;
        }

        setError("");
        setIsLoading(true);
        
        try {
            // Call AI API to generate questions
            const aiResponse = await axiosInstance.post(
                API_PATHS.AI.GENERATE_QUESTIONS,
                {
                    role,
                    experience,
                    topicsToFocus,
                    numberOfQuestions: 10,
                }
            );

            const generatedQuestions = aiResponse.data;
            const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
                ...formData,
                questions: generatedQuestions,
            });

            if(response.data?.session?._id){
                navigate(`/prepzen/${response.data?.session?._id}`);
            }
        } catch (error) {
            console.error("Failed to create session", error);
            setError("Failed to create session. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
  return (
    <div className="w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-black">
            Start a New Interview Journey
        </h3>

        <p className="text-xs text-slate-700 mt-[5px] mb-3">
            Fill out a few quick details and unlock your personalized interview Questions!
        </p>

        <form onSubmit={handelCreateSession} className="flex flex-col gap-3">
            <Input
                value={formData.role}
                onChange={({target}) => handleChange("role", target.value)}
                label="Target Role"
                placeholder="E.g. Frontend Developer, Software Engineer etc."
                type="text"
            />

            <Input
                value={formData.experience}
                onChange={({target}) => handleChange("experience", target.value)}
                label="Years of Experience"
                placeholder="E.g. 1 Year, 2 Years, 5+ Years etc."
                type="number"
            />

            <Input
                value={formData.topicsToFocus}
                onChange={({target}) => handleChange("topicsToFocus", target.value)}
                label="Topics to Focus On"
                placeholder="E.g. React, System Design, Algorithms etc."
                type="text"
            />

            <Input
                value={formData.description}
                onChange={({target}) => handleChange("description", target.value)}
                label="Brief Description"
                placeholder="E.g. I am preparing for my next big tech interview at FAANG etc."
                type="text"
                isTextArea
            />

            {error && (
                <p className="text-xs text-rose-500 pb-2.5">
                    {error}
                </p>
            )}

            <button
                type="submit"
                className="btn-primary w-full mt-2"
                disabled={isLoading}
            >
                {isLoading && <SpinnerLoader/> } Create Session
            </button>
        </form>
    </div>
  )
}

export default CreateSessionForm