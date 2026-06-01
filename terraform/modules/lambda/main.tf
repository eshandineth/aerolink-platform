data "archive_file" "notification_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../services/notification-service/src/index.js"
  output_path = "${path.module}/notification-service.zip"
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.project_name}-lambda-exec-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_sqs_execution" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

resource "aws_lambda_function" "notification_service" {
  filename         = data.archive_file.notification_lambda_zip.output_path
  function_name    = "${var.project_name}-notification-service"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.notification_lambda_zip.output_base64sha256
  runtime          = "nodejs18.x"
}

resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.notification_queue_arn
  function_name    = aws_lambda_function.notification_service.arn
  batch_size       = 10
}
