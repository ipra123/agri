import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/decoration_model.dart';
import '../models/booking_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  final String baseUrl = ApiConfig.baseUrl;

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      if (token != null) 'Cookie': 'auth_token=$token',
    };
  }

  Future<List<DecorationModel>> getDecorations() async {
    final response = await http.get(Uri.parse('$baseUrl/decorations'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => DecorationModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load decorations');
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Login failed');
    }
  }

  Future<Map<String, dynamic>> register(String fullName, String email, String password) async {
    final prefs = await SharedPreferences.getInstance();
    final regCookie = prefs.getString('reg_verified_cookie');

    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {
        'Content-Type': 'application/json',
        if (regCookie != null) 'Cookie': regCookie,
      },
      body: json.encode({'fullName': fullName, 'email': email, 'password': password}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Registration failed');
    }
  }

  Future<Map<String, dynamic>> sendOtp(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/otp/send'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to send OTP');
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/otp/verify'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'otp': code}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('reg_verified_cookie', 'reg_verified=true');
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to verify OTP');
    }
  }

  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/bookings'),
      headers: headers,
      body: json.encode(bookingData),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to create booking');
    }
  }

  // New method to process WaafiPay purchase
  Future<Map<String, dynamic>> purchaseWaafi({
    required String accountNo,
    required double amount,
    required String currency,
    required String referenceId,
    required String bookingId,
  }) async {
    final headers = await _getHeaders();
    final body = json.encode({
      'accountNo': accountNo,
      'amount': amount,
      'currency': currency,
      'referenceId': referenceId,
      'bookingId': bookingId,
    });
    final response = await http.post(
      Uri.parse('${"${baseUrl}"}/waafi/purchase'),
      headers: headers,
      body: body,
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200 && (data['success'] == true || data['status'] == 'success')) {
      return data;
    } else {
      throw Exception(data['message'] ?? data['error'] ?? 'WaafiPay purchase failed');
    }
  }

  Future<List<BookingModel>> getUserBookings() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/user/bookings'),
      headers: headers,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => BookingModel.fromJson(json)).toList();
    } else {
      final data = json.decode(response.body);
      throw Exception(data['error'] ?? 'Failed to load bookings');
    }
  }

  Future<Map<String, dynamic>> cancelBooking(String bookingId) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/cancellations'),
      headers: headers,
      body: json.encode({'bookingId': bookingId}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to cancel booking');
    }
  }

  Future<Map<String, dynamic>> payBookingBalance(String bookingId, double amount, String method) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/payments'),
      headers: headers,
      body: json.encode({
        'bookingId': bookingId,
        'amount': amount,
        'method': method,
        'transactionId': 'TXN-${DateTime.now().millisecondsSinceEpoch}',
      }),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Failed to process payment');
    }
  }
}
