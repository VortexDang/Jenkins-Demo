pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'bentin345/expressapp'
        MYSQL_CONTAINER_NAME = 'express-mysql'
        MYSQL_ROOT_LOGIN = credentials('mysql-root-login')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                }
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Push Docker image') {
            steps {
                sh 'docker push $DOCKER_IMAGE'
            }
        }

        stage('Deploy MySQL to DEV') {
            steps {
                sh 'docker image pull mysql:5.7'
                sh 'docker network create dev || echo "this network exists"'
                sh 'docker container stop $MYSQL_CONTAINER_NAME || echo "this container does not exist" '
                sh 'echo y | docker container prune '

        withCredentials([usernamePassword(credentialsId: 'mysql-root-login', usernameVariable: 'MYSQL_USER', passwordVariable: 'MYSQL_PASSWORD')]) {
                    sh """
                        docker run --name $MYSQL_CONTAINER_NAME --rm --network dev -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD -e MYSQL_DATABASE=cicd_demo -d mysql:5.7
                    """
                    sh 'sleep 20'
                    // If you have initialization SQL scripts
                    sh "docker exec -i $MYSQL_CONTAINER_NAME mysql --user=root --password=$MYSQL_PASSWORD < script"
                }
            }
        }

        stage('Deploy ExpressJS App to DEV') {
            steps {
                sh 'docker image pull $DOCKER_IMAGE'
                sh 'docker container stop express-app-container || echo "this container does not exist" '
                sh 'docker network create dev || echo "this network exists"'
                sh 'echo y | docker container prune '
                sh 'docker container run -d --rm --name express-app-container -p 3000:3000 --network dev $DOCKER_IMAGE'
            }
        }
    }

    post {
        always {
            sh """
                docker stop $MYSQL_CONTAINER_NAME && docker rm $MYSQL_CONTAINER_NAME
                docker stop express-app-container && docker rm express-app-container
                docker rmi $DOCKER_IMAGE
            """
        }
    }
}
