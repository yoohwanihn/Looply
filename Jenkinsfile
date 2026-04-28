pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    environment {
        BACKEND_IMAGE  = 'sns-backend'
        FRONTEND_IMAGE = 'sns-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        // ── A: 테스트 ──────────────────────────────────
        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh 'chmod +x gradlew'
                    sh './gradlew test --no-daemon'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'backend/build/test-results/**/*.xml'
                }
            }
        }

        // ── B: 빌드 ────────────────────────────────────
        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh './gradlew bootJar --no-daemon -x test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                    docker build \\
                        --target prod \\
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \\
                        -t ${BACKEND_IMAGE}:latest \\
                        ./backend

                    docker build \\
                        --target prod \\
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \\
                        -t ${FRONTEND_IMAGE}:latest \\
                        ./frontend
                """
            }
        }

        // ── C: 배포 (main / develop 브랜치만) ──────────
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                sh '''
                    docker compose -f docker-compose.prod.yml \
                        up -d --force-recreate
                '''
                echo "배포 완료: http://192.168.0.199"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Build #${BUILD_NUMBER} (${BRANCH_NAME}) 성공"
        }
        failure {
            echo "❌ Build #${BUILD_NUMBER} (${BRANCH_NAME}) 실패"
        }
    }
}
