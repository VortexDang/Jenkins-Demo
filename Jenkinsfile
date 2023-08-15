pipeline {
    agent any

    environment {
        // Using credentials for MySQL login
        MYSQL_ROOT_LOGIN = credentials('mysql-root-login')
    }

    tools {
        docker 'Docker'
    }

    stages {
        stage('Build Docker Image for ExpressJS') {
            steps {
                script {
                    // Build Docker image for the ExpressJS application
                    sh 'docker build -t bentin345/expressjsapp .'
                }
            }
        }

        stage('Push Docker Image to DockerHub') {
            steps {
                // Push the built image to DockerHub
                withDockerRegistry(credentialsId: 'dockerhub', url: 'https://index.docker.io/v1/') {
                    sh 'docker push bentin345/expressjsapp'
                }
            }
        }

        stage('Deploy MySQL to DEV') {
            steps {
                echo 'Deploying MySQL and cleaning up if necessary'
                sh 'docker image pull mysql:5.7'
                sh 'docker network create dev || echo "Network dev already exists"'
                sh 'docker container stop expressjs-mysql || echo "MySQL container does not exist"'
                sh 'echo y | docker container prune '
                sh 'docker volume rm expressjs-mysql-data || echo "No such volume"'

                // Running MySQL container
                sh """
                docker run --name expressjs-mysql --rm --network dev -v expressjs-mysql-data:/var/lib/mysql \
                -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_LOGIN} -e MYSQL_DATABASE=expressjsdb -d mysql:5.7
                """
                sh 'sleep 20' // Allow some time for MySQL to initialize
            }
        }

        stage('Deploy ExpressJS App to DEV') {
            steps {
                echo 'Deploying ExpressJS app and cleaning up if necessary'
                sh 'docker image pull bentin345/expressjsapp'
                sh 'docker container stop expressjs-app || echo "ExpressJS app container does not exist"'
                sh 'docker network create dev || echo "Network dev already exists"'
                sh 'echo y | docker container prune '

                // Running the ExpressJS app container and linking it to the MySQL container
                sh """
                docker run -d --rm --name expressjs-app -p 3000:3000 --network dev --link expressjs-mysql:mysql \
                -e MYSQL_HOST=mysql -e MYSQL_USER=root -e MYSQL_PASSWORD=${MYSQL_ROOT_LOGIN} -e MYSQL_DATABASE=expressjsdb \
                bentin345/expressjsapp
                """
            }
        }
    }

    post {
        // Clean up after the build
        always {
            sh """
            docker stop expressjs-mysql || true
            docker stop expressjs-app || true
            """
            cleanWs() // Cleaning up the workspace
        }
    }
}
