pipeline {
    agent any

    environment {
        MYSQL_ROOT_LOGIN = credentials('mysql-root-login')
    }

    tools {
        dockerTool 'myDocker' 
    }

    stages {
        stage('Build Docker Image for ExpressJS') {
            steps {
                sh 'docker build -t bentin345/expressjsapp .'
            }
        }

        stage('Push Docker Image to DockerHub') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub', url: 'https://index.docker.io/v1/') {
                    sh 'docker push bentin345/expressjsapp'
                }
            }
        }

        stage('Deploy MySQL to DEV') {
            steps {
                script {
                    echo 'Deploying MySQL and cleaning up'
                    sh 'docker image pull mysql:5.7'
                    sh 'docker network create dev || echo "Network dev already exists"'
                    sh 'docker container stop expressjs-mysql || echo "MySQL container does not exist"'
                    sh 'echo y | docker container prune'
                    sh 'docker volume rm expressjs-mysql-data || echo "No such volume"'
                    sh """
                    docker run --name expressjs-mysql --rm --network dev -v expressjs-mysql-data:/var/lib/mysql \
                    -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_LOGIN} -e MYSQL_DATABASE=expressjsdb -d mysql:5.7
                    """
                    // Check for MySQL to be ready instead of fixed sleep
                    for(int i = 0; i < 30; i++) {
                        def status = sh(script: "docker exec expressjs-mysql mysqladmin ping --silent", returnStatus: true)
                        if (status == 0) {
                            break
                        }
                        echo "Waiting for MySQL to be ready..."
                        sh 'sleep 5'
                    }
                }
            }
        }

        stage('Deploy ExpressJS App to DEV') {
            steps {
                echo 'Deploying ExpressJS app'
                sh 'docker image pull bentin345/expressjsapp'
                sh 'docker container stop expressjs-app || echo "ExpressJS app container does not exist"'
                sh """
                docker run -d --rm --name expressjs-app -p 3000:3000 --network dev --link expressjs-mysql:mysql \
                -e MYSQL_HOST=mysql -e MYSQL_USER=root -e MYSQL_PASSWORD=${MYSQL_ROOT_LOGIN} -e MYSQL_DATABASE=expressjsdb \
                bentin345/expressjsapp
                """
            }
        }
    }

    post {
        always {
            sh """
            docker stop expressjs-mysql || true
            docker stop expressjs-app || true
            """
            cleanWs()
        }
    }
}
