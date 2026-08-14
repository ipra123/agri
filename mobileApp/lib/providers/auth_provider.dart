import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  User? _user;
  String? _token;
  bool _isLoading = false;
  bool _isInitialized = false;

  User? get user => _user;
  bool get isAuthenticated => _token != null && _user != null;
  bool get isLoading => _isLoading;
  bool get isInitialized => _isInitialized;
  ApiService get apiService => _apiService;

  AuthProvider() {
    _loadUser();
  }

  String? _extractToken(dynamic data) {
    if (data == null) return null;
    if (data is String) {
      final trimmed = data.trim();
      if (trimmed.isEmpty || trimmed == 'null' || trimmed == 'undefined') return null;
      return trimmed;
    }
    if (data is Map) {
      final map = data.cast<String, dynamic>();
      for (final key in const ['token', 'accessToken', 'access_token', 'jwt', 'auth_token']) {
        final value = map[key];
        if (value is String && value.trim().isNotEmpty) return value.trim();
      }
      for (final key in const ['data', 'user', 'result']) {
        final nested = _extractToken(map[key]);
        if (nested != null) return nested;
      }
    }
    return null;
  }

  Future<void> _loadUser() async {
    _isLoading = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token') ?? prefs.getString('token');
    final userDataString = prefs.getString('user_data');

    try {
      if (_token != null && userDataString != null) {
        _user = User.fromJson(json.decode(userDataString));
      } else if (_token != null) {
        final profile = await _apiService.getProfile();
        _user = User.fromJson(profile);
        await prefs.setString('user_data', json.encode(profile));
      }
    } catch (_) {
      await prefs.remove('auth_token');
      await prefs.remove('token');
      await prefs.remove('user_data');
      _token = null;
      _user = null;
    }

    _isLoading = false;
    _isInitialized = true;
    notifyListeners();
  }

  Future<void> _saveUser(String token, Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('token', token);
    await prefs.setString('user_data', json.encode(userData));
    _token = token;
    _user = User.fromJson(userData);
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _apiService.login(email, password);
      final token = _extractToken(data);
      if (token != null) {
        await _saveUser(token, data);
      } else {
        throw Exception('Login succeeded, but no token was returned by the server.');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> verifyOtp(String email, String code) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _apiService.verifyOtp(email, code);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> registerAndLogin(String fullName, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _apiService.register(fullName, email, password);
      final token = _extractToken(data);
      if (token != null) {
        await _saveUser(token, data);
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('token');
    await prefs.remove('user_data');
    _token = null;
    _user = null;
    notifyListeners();
  }
}
