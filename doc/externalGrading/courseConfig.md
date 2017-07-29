# Course Configuration

So you want to add external grader support to a question? Great! You'll need the following things, each of which will be covered in detail:

* A Docker image specifying the environment of your grader
* Modifications to your question's `info.json`
* A script to serve as an entrypoint to your grading job

## Docker image

Docker is a container platform. You can think of a container like a lightweight VM: it has the benefits of an isolated machine like a VM, but doesn't bundle a whole operating system. They let you specify a self-contained and reproducible environment to execute code in. PrairieLearn runs all external grading jobs inside a container that is specified for each question. This provides a great deal of flexibility for courses: you can build a docker image that contains any necessary dependencies, applications, and libraries you might need.
