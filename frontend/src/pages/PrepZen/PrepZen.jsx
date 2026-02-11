import React, { use, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { AnimatePresence, motion, number } from 'framer-motion';
import { LuCircleAlert, LuListCollapse } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
function PrepZen() {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openLeanMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  const fetchSessionDetailsById = async () => {
    // API call to fetch session details by ID
    try{
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if(response.data && response.data.session){
        setSessionData(response.data.session);
      }
    }catch(error){
      console.error("Failed to fetch session details", error);
    }
  };

  const generateConceptExplanation = async (question) => {
    // API call to generate answer for a question
    try {
      setErrorMsg("");
      setExplanation(null);

      setIsLoading(true);
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
          { question }
      );

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to fetch explanation. Please try again.");
      console.error("Failed to fetch explanation", error);
    }finally{
      setIsLoading(false);
    }
  }

  const toggleQuestionPinStatus = async (questionId) => {
    // API call to pin/unpin a question
    try{
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      if( response.data && response.data.question){
        fetchSessionDetailsById();
      }
    }catch(error){
      console.error("Failed to update question pin status", error);
    }
  }

  const uploadMoreQuestions = async () => {
    // API call to generate and add more questions
    try {
      setIsUpdateLoader(true);
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          question: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("Successfully added more questions");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if(error.response && error.response.data.message){
        setErrorMsg(error.response.data.message);
      }else{
        setErrorMsg("Failed to add more questions. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }

    return () => {
      setSessionData(null);
      setErrorMsg("");
    };
  }, [sessionId]);

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
          ? moment(sessionData.updatedAt).format("DD MMM, YYYY")
          : ""
        }
      />

      <div className="container mx-auto px-4 pb-4 pt-4 md:px-0">
        <h2 className="text-lg font-semibold color-black">Interview Q & A</h2>

        <div className="grid grid-cols-12 gap-4 mt-5 mb-10">
        <div
             className={`col-span-12 ${
             openLeanMoreDrawer ? "md:col-span-7" : "md:col-span-8"
           }`}
        >
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => {
                return (
                  <motion.div
                    key={data._id || index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.4, 
                      type: "spring",
                      stiffness: 100,
                      delay: index * 0.1,
                      damping: 15,
                    }}
                    layout // this is key prop for layout animation
                    layoutId={`question-${data._id || index}`} // helps framer track the element
                  >
                    <>
                      <QuestionCard
                        question={data?.question}
                        answer={data?.answer}
                        onLearnMore={() =>
                          generateConceptExplanation(data?.question)
                        }
                        isPinned={data?.isPinned}
                        onTogglePin={() => toggleQuestionPinStatus(data?._id)}
                      />

                    {!isLoading && 
                        sessionData?.questions?.length == index + 1 && (
                          <div className="flex items-center justify-center mt-5">
                            <button 
                              className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer"
                              disabled={isLoading || isUpdateLoader}
                              onClick={uploadMoreQuestions}
                            >
                              {isUpdateLoader ? (
                                <SpinnerLoader/>
                              ) : (
                                <LuListCollapse size={16} className="text-lg" />
                              )}{" "}
                              Load More
                            </button>
                          </div>
                    )}
                  </>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <Drawer
            isOpen={openLeanMoreDrawer}
            onClose={() => setOpenLearnMoreDrawer(false)}
            title={!isLoading && explanation?.title}
          >
            {errorMsg && (
              <p className="flex gap-2 text-sm text-amber-600 font-medium">
                <LuCircleAlert className="mt-1" /> {errorMsg}
              </p>
            )}
            {isLoading && <SkeletonLoader />}
            {!isLoading && explanation && (
              <AIResponsePreview content={explanation?.explanation} />
            )}
          </Drawer>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PrepZen
