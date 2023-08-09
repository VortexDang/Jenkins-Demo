pipeline {
    agent any

    environment {
        MYSQL_ROOT_LOGIN = credentials('mysql-root-login')
    }

    stages {
        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: 'Built-In Node') {
                sh 'npm install'            }
        }

        stage('Package/Push Image') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub', url: 'https://index.docker.io/v1/') {
                    sh 'docker build -t bentin345/cicddemo .'
                    sh 'docker push bentin345/cicddemo'
                }
            }
        }

        stage('Deploy MySQL to DEV') {
            steps {
                echo 'Deploying and cleaning'
                sh 'docker image pull mysql:5.7'
                sh 'docker network create dev || echo "this network exists"'
                sh 'docker container stop bentin345-mysql || echo "this container does not exist"'
                sh 'echo y | docker container prune'
                sh 'docker volume rm bentin345-mysql-data || echo "no volume"'

                sh "docker run --name bentin345-mysql --rm --network dev -v bentin345-mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_LOGIN_PSW} -e MYSQL_DATABASE=cicd_demo -d mysql:5.7"
                sh 'sleep 20'
                sh "docker exec -i bentin345-mysql mysql --user=root --password=${MYSQL_ROOT_LOGIN_PSW} < script"
            }
        }

        stage('Deploy Node.js App to DEV') {
            steps {
                echo 'Deploying and cleaning'
                sh 'docker image pull bentin345/cicddemo'
                sh 'docker container stop cicddemo|| echo "this container does not exist"'
                sh 'docker network create dev || echo "this network exists"'
                sh 'echo y | docker container prune'

                sh 'docker container run -d --rm --name cicddemo -p 3000:3000 --network dev bentin345/cicddemo'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
