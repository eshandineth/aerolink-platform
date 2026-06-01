output "users_table_name" {
  value = aws_dynamodb_table.users_table.name
}

output "flights_table_name" {
  value = aws_dynamodb_table.flights_table.name
}

output "bookings_table_name" {
  value = aws_dynamodb_table.bookings_table.name
}

output "baggage_table_name" {
  value = aws_dynamodb_table.baggage_table.name
}
