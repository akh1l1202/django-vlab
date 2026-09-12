const quizContainer = document.getElementById("quiz");
const resultsContainer = document.getElementById("results");
const submitButton = document.getElementById("submit");


function showResults() {
  // gather answer containers from our quiz
  const answerContainers = quizContainer.querySelectorAll(".answers");
  const questionBlocks = quizContainer.querySelectorAll(".quiz-question");
  answerContainers.forEach(e => e.style.color = "black");

  // keep track of user's answers
  let numCorrect = 0;
  let numVisible = 0;

  // for each question...
  myQuestions.forEach((currentQuestion, questionNumber) => {
    if (questionBlocks.length && questionBlocks[questionNumber].hidden) {
      return;
    }
    numVisible++;

    // find selected answer
    const answerContainer = answerContainers[questionNumber];
    const selector = `input[name=question${questionNumber}]:checked`;
    const userAnswerElement = answerContainer.querySelector(selector);
    const userAnswer = userAnswerElement ? userAnswerElement.value : undefined;
  
    // Log the value and type of userAnswer
    //console.log(`Question ${questionNumber + 1}: userAnswer =`, userAnswer, `, type =`, typeof userAnswer);
  
    // if answer is correct
    if (userAnswer === currentQuestion.correctAnswer) {
      // add to the number of correct answers
      numCorrect++;
  
      // color the selected answer green
      if (userAnswerElement) {
        userAnswerElement.parentElement.style.color = "lightgreen";
      }
    } 
    // if answer is blank
    else if (userAnswer === undefined) {
      // color the answers black      
      answerContainers[questionNumber].style.color = "black";
    } 
    // if answer is wrong
    else {       
      // color the answers red
      if (userAnswerElement) {
        userAnswerElement.parentElement.style.color = "red";
      }
    }
  });
  // show number of correct answers out of total
  resultsContainer.innerHTML = numVisible
    ? `${numCorrect} out of ${numVisible}`
    : "Select at least one difficulty level.";
}


submitButton.addEventListener("click", showResults);
