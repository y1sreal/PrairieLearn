# External Grading Overview

PrairieLearn offers three types of grading for questions: Internal, Manual, and External. External grading gives you great flexibility in your grading process by allowing you to run custom grading scripts in the language and environment of your choice. This enables a number of powerful use cases:

* Compiling and testing C system code on a Linux machine
* Testing Verilog code
* Running MIPS assemply in SPIM

You can think of PrairieLearn's external grader as a secure code execution service. If you specify an environment (in the form of a [Docker image](https://www.docker.com/)) and an executable (most often in the form of a shell script), PrairieLearn will take care of...

* spinning up an instance of your Docker container
* moving your executable, any additional files, and the student's submission into the Docker instance
* running your specified executable
* capturing the output
* reporting the results back to PrairieLearn
