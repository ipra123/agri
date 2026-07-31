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

  User? get user => _user;
  bool get isAuthenticated => _token != null && _user != null;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    final userDataString = prefs.getString('user_data');
    
    if (_token != null && userDataString != null) {
      _user = User.fromJson(json.decode(userDataString));
      notifyListeners();
    }
  }

  Future<void> _saveUser(String token, Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
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
      if (data['token'] != null && data['user'] != null) {
        await _saveUser(data['token'], data['user']);
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
      if (data['token'] != null && data['user'] != null) {
        await _saveUser(data['token'], data['user']);
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
    _token = null;
    _user = null;
    notifyListeners();
  }
}
