class User {
  final String id;
  final String email;
  final String? fullName;
  final String role;
  
  User({
    required this.id, 
    required this.email, 
    this.fullName, 
    required this.role
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'],
      role: json['role'] ?? 'USER',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'role': role,
    };
  }
}
