pipeline {
    agent any

    environment {
        MYSQL_ROOT_LOGIN = credentials('mysql-root-login')
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
                    sh 'echo y | docker container prune '
                    sh 'docker volume rm expressjs-mysql-data || echo "No such volume"'                    
                    sh "docker run --name expressjs-mysql --rm --network dev -v expressjs-mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_LOGIN} -e MYSQL_DATABASE=cicd_demo -d mysql:8.0"

                    sh 'sleep 20'
                    sh "docker exec -i expressjs-mysql mysql --user=root --password=${MYSQL_ROOT_LOGIN} < script"
                }
            }
        }

        stage('Deploy ExpressJS App to DEV') {
            steps {
                echo 'Deploying ExpressJS app'
                sh 'docker image pull bentin345/expressjsapp'
                sh 'docker container stop expressjs-app || echo "ExpressJS app container does not exist"'
                sh 'docker network create dev || echo "this network exists"'
                sh 'echo y | docker container prune '

                withEnv([
                    "MYSQL_HOST_NAME=expressjs-mysql",
                    "MYSQL_USER_NAME=root",
                    "MYSQL_PWD=${MYSQL_ROOT_LOGIN}",
                    "MYSQL_DB_NAME=cicd_demo"
                ]) {
                    sh """
                    docker run -d --name expressjs-app --rm -p 3000:3000 --network dev \
                    -e MYSQL_HOST=$MYSQL_HOST_NAME -e MYSQL_USER=$MYSQL_USER_NAME -e MYSQL_PASSWORD=$MYSQL_PWD -e MYSQL_DATABASE=$MYSQL_DB_NAME \
                    bentin345/expressjsapp
                    """
                }            
            }
        }
    }

    post {
        // Clean after build
        always {
            cleanWs()
        }
    }
}
