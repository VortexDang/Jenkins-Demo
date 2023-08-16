pipeline {
    agent any

    environment {
        MYSQL_DATABASE_NAME = 'cicd_demo'
    }

    tools {
        dockerTool 'myDocker'
    }

    stages {
        stage('Build and Push Docker Image to DockerHub') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub', url: 'https://index.docker.io/v1/') {
                    sh 'docker build -t bentin345/expressjsapp .'
                    sh 'docker push bentin345/expressjsapp'
                }
            }
        }

        stage('Deploy MySQL to DEV') {
            steps {
                script {
                    echo 'Deploying MySQL and cleaning up if necessary'
                    sh 'docker image pull mysql:8.0'
                    sh 'docker network create dev || echo "Network dev already exists"'
                    sh 'docker container stop expressjs-mysql || echo "MySQL container does not exist"'
                    sh 'echo y | docker container prune'
                    sh 'docker volume rm expressjs-mysql-data || echo "No such volume"'
                    withCredentials([usernamePassword(credentialsId: 'mysql-root-login', usernameVariable: 'MYSQL_USER', passwordVariable: 'MYSQL_PWD')]) {
                        sh """
                        docker run --name expressjs-mysql --rm --network dev -v expressjs-mysql-data:/var/lib/mysql \
                        -e MYSQL_ROOT_PASSWORD=$MYSQL_PWD -e MYSQL_DATABASE=$MYSQL_DATABASE_NAME -d mysql:8.0
                        """

                        // Check MySQL availability
                        for (int i = 0; i < 30; i++) {
                            def isUp = sh(script: "docker exec expressjs-mysql mysql --user=$MYSQL_USER --password=$MYSQL_PWD -e 'SELECT 1'", returnStatus: true)
                            if (isUp == 0) {
                                break
                            }
                            if (i == 29) {
                                error "MySQL did not start within expected time"
                            }
                            sh "sleep 10"
                        }

                        sh "docker exec -i expressjs-mysql mysql --user=$MYSQL_USER --password=$MYSQL_PWD < script"
                    }
                }
            }
        }

        stage('Deploy ExpressJS App to DEV') {
            steps {
                echo 'Deploying ExpressJS app'
                sh 'docker image pull bentin345/expressjsapp'
                sh 'docker container stop expressjs-app || echo "ExpressJS app container does not exist"'
                sh 'docker network create dev || echo "this network exists"'
                sh 'echo y | docker container prune'

                withCredentials([usernamePassword(credentialsId: 'mysql-root-login', usernameVariable: 'MYSQL_USER_NAME', passwordVariable: 'MYSQL_PWD')]) {
                    sh """
                    docker run -d --name expressjs-app --rm -p 3000:3000 --network dev \
                    -e MYSQL_HOST=expressjs-mysql -e MYSQL_USER=$MYSQL_USER_NAME -e MYSQL_PASSWORD=$MYSQL_PWD -e MYSQL_DATABASE=$MYSQL_DATABASE_NAME \
                    bentin345/expressjsapp
                    """
                }            
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}