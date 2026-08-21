import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/decoration_model.dart';
import '../models/booking_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  final String baseUrl = ApiConfig.baseUrl;

  Map<String, dynamic> _decodeObject(http.Response response) {
    try {
      final decoded = json.decode(response.body);
      if (decoded is Map) return Map<String, dynamic>.from(decoded);
    } catch (_) {
      // The deployment can return an HTML or empty body when the function crashes.
    }
    return {
      'message': 'Server returned an invalid response (${response.statusCode})',
    };
  }

  String? _readToken(Map<String, Object?> values) {
    final candidates = [
      values['auth_token'],
      values['token'],
      values['access_token'],
      values['accessToken'],
      values['jwt'],
      values['data'],
      values['user'],
      values['result'],
    ];

    for (final value in candidates) {
      if (value is String &&
          value.isNotEmpty &&
          value != 'null' &&
          value != 'undefined') {
        return value;
      }
      if (value is Map) {
        final nested = _readToken(value.cast<String, Object?>());
        if (nested != null) return nested;
      }
    }

    return null;
  }

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = _readToken({
      'auth_token': prefs.getString('auth_token'),
      'token': prefs.getString('token'),
      'access_token': prefs.getString('access_token'),
      'accessToken': prefs.getString('accessToken'),
      'jwt': prefs.getString('jwt'),
    });
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      if (token != null) 'Cookie': 'auth_token=$token; token=$token',
    };
  }

  Future<Map<String, dynamic>> getProfile() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/auth/profile'),
      headers: headers,
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return Map<String, dynamic>.from(data as Map);
    }
    throw Exception(data['message'] ?? 'Failed to load profile');
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
    final response = await http
        .post(
          Uri.parse('$baseUrl/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({'email': email, 'password': password}),
        )
        .timeout(const Duration(seconds: 20));
    final data = _decodeObject(response);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['message'] ?? data['error'] ?? 'Login failed');
    }
  }

  Future<Map<String, dynamic>> register(
    String fullName,
    String email,
    String password,
  ) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/auth/register'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({
            'name': fullName,
            'email': email,
            'password': password,
          }),
        )
        .timeout(const Duration(seconds: 20));
    final data = _decodeObject(response);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return data;
    } else {
      throw Exception(
        data['message'] ?? data['error'] ?? 'Registration failed',
      );
    }
  }

  Future<Map<String, dynamic>> sendOtp(String email) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/auth/send-otp'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({'email': email}),
        )
        .timeout(const Duration(seconds: 20));
    final data = _decodeObject(response);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to send OTP code');
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String code) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/auth/verify-otp'),
          headers: {'Content-Type': 'application/json'},
          body: json.encode({'email': email, 'otp': code}),
        )
        .timeout(const Duration(seconds: 20));
    final data = _decodeObject(response);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Invalid OTP code');
    }
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email}),
    );
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to reset password');
    }
  }

  Future<void> _handleErrorResponse(http.Response response) async {
    if (response.statusCode == 401) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('token');
      await prefs.remove('user_data');
    }
  }

  Future<Map<String, dynamic>> createBooking(
    Map<String, dynamic> bookingData,
  ) async {
    final headers = await _getHeaders();
    final payload = {...bookingData, 'isOffline': true};
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: headers,
      body: json.encode(payload),
    );
    if (response.statusCode >= 400) {
      await _handleErrorResponse(response);
    }
    final data = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return data;
    } else {
      throw Exception(
        data['message'] ?? data['error'] ?? 'Failed to create order',
      );
    }
  }

  Future<List<dynamic>> getSuppliers() async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers/public'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load suppliers');
    }
  }

  Future<Map<String, dynamic>> getSupplierById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/suppliers/public/$id'));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load supplier details');
    }
  }

  Future<Map<String, dynamic>> createReview({
    String? productId,
    String? supplierId,
    required int rating,
    required String comment,
    required String targetType,
  }) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/reviews'),
      headers: headers,
      body: json.encode({
        if (productId != null) 'productId': productId,
        if (supplierId != null) 'supplierId': supplierId,
        'rating': rating,
        'comment': comment,
        'targetType': targetType,
      }),
    );
    if (response.statusCode >= 400) {
      await _handleErrorResponse(response);
    }
    final data = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Failed to submit review');
    }
  }

  Future<List<dynamic>> getProductReviews(String productId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/reviews/product/$productId'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      return [];
    }
  }

  Future<List<dynamic>> getSupplierReviews(String supplierId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/reviews/supplier/$supplierId'),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      return [];
    }
  }

  Future<List<BookingModel>> getUserBookings() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/orders/myorders'),
      headers: headers,
    );
    if (response.statusCode >= 400) {
      await _handleErrorResponse(response);
    }
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => BookingModel.fromJson(json)).toList();
    } else {
      final data = json.decode(response.body);
      throw Exception(
        data['message'] ?? data['error'] ?? 'Failed to load orders',
      );
    }
  }

  Future<Map<String, dynamic>> cancelBooking(String bookingId) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/orders/$bookingId/cancel'),
      headers: headers,
    );
    if (response.statusCode >= 400) {
      await _handleErrorResponse(response);
    }
    final data = json.decode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(
        data['message'] ?? data['error'] ?? 'Failed to cancel order',
      );
    }
  }

  Future<Map<String, dynamic>> payBookingBalance(
    String bookingId,
    double amount,
    String paymentMethod,
  ) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/orders/$bookingId/pay'),
      headers: headers,
      body: json.encode({'amount': amount, 'paymentMethod': paymentMethod}),
    );
    if (response.statusCode >= 400) {
      await _handleErrorResponse(response);
    }
    final data = json.decode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return data;
    } else {
      throw Exception(
        data['message'] ?? data['error'] ?? 'Failed to process payment',
      );
    }
  }
}
