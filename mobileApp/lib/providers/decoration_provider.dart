import 'package:flutter/material.dart';
import '../models/decoration_model.dart';
import '../services/api_service.dart';

class DecorationProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<DecorationModel> _decorations = [];
  bool _isLoading = false;
  String _error = '';

  List<DecorationModel> get decorations => _decorations;
  bool get isLoading => _isLoading;
  String get error => _error;

  List<String> get categories {
    final Set<String> cats = {'All'};
    for (var doc in _decorations) {
      cats.add(doc.category);
    }
    return cats.toList();
  }

  Future<void> fetchDecorations() async {
    _isLoading = true;
    _error = '';
    notifyListeners();
    
    try {
      _decorations = await _apiService.getDecorations();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
