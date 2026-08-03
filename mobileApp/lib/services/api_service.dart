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
    final response = await http.get(Uri.parse('$baseUrl/products'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => DecorationModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load products');
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
      throw Exception(data['message'] ?? data['error'] ?? 'Login failed');
    }
  }

  Future<Map<String, dynamic>> register(String fullName, String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'name': fullName, 'email': email, 'password': password}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return data;
    } else {
      throw Exception(data['message'] ?? data['error'] ?? 'Registration failed');
    }
  }

  Future<Map<String, dynamic>> sendOtp(String email) async {
    // Backend doesn't support OTP - return dummy success immediately for compatibility if called
    return {'success': true, 'message': 'OTP bypassed'};
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String code) async {
    // Backend doesn't support OTP - return dummy success immediately for compatibility if called
    return {'success': true, 'message': 'OTP verification bypassed'};
  }

  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: headers,
      body: json.encode(bookingData),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return data;
    } else {
      throw Exception(data['message'] ?? data['error'] ?? 'Failed to create order');
    }
  }

  // Bypassed method for legacy code compatibility
  Future<Map<String, dynamic>> purchaseWaafi({
    required String accountNo,
    required double amount,
    required String currency,
    required String referenceId,
    required String bookingId,
  }) async {
    return {'success': true, 'message': 'Waafi payment completed during order creation'};
  }

  Future<List<BookingModel>> getUserBookings() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/orders/myorders'),
      headers: headers,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => BookingModel.fromJson(json)).toList();
    } else {
      final data = json.decode(response.body);
      throw Exception(data['message'] ?? data['error'] ?? 'Failed to load orders');
    }
  }

  Future<Map<String, dynamic>> cancelBooking(String bookingId) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/orders/$bookingId/cancel'),
      headers: headers,
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['message'] ?? data['error'] ?? 'Failed to cancel order');
    }
  }

  Future<Map<String, dynamic>> payBookingBalance(String bookingId, double amount, String method) async {
    return {'success': true, 'message': 'Deposit system disabled. Order is paid in full.'};
  }
}
