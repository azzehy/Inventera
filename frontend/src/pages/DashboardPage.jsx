import React, { useState, useEffect } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  AlertTriangle,
  XCircle,
  Users,
  BarChart3,
  Loader,
  Calendar
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    enterprise: null,
    products: [],
    transactions: [],
    users: [],
    categories: [],
    partners: []
  });
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPurchases: 0,
    totalSales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalUsers: 0,
    totalTransactions: 0,
    monthlyData: []
  });
  
  const [timeFilter, setTimeFilter] = useState("6months");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData.transactions.length > 0 || dashboardData.products.length > 0) {
      calculateStats();
    }
  }, [dashboardData, timeFilter]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const enterpriseRes = await ApiService.getMyEnterpriseStats();
      
      const [
        productsRes,
        categoriesRes,
        partnersRes,
        transactionsRes,
        usersRes
      ] = await Promise.all([
        ApiService.getMyEnterpriseProducts(),
        ApiService.getMyEnterpriseCategories(),
        ApiService.getMyEnterprisePartners(),
        ApiService.getMyEnterpriseTransactions(0, 1000),
        ApiService.getLoggedInUsesInfo().then(res => 
          ApiService.getUsersByEnterprise(res.user.enterpriseId)
        ).catch(() => ({ users: [] }))
      ]);

      setDashboardData({
        enterprise: enterpriseRes.enterprise || null,
        products: productsRes.products || [],
        categories: categoriesRes.categories || [],
        partners: partnersRes.partners || [],
        transactions: transactionsRes.transactions?.content || [],
        users: usersRes.users || []
      });

    } catch (error) {
      showMessage(
        error.response?.data?.message || "Error loading dashboard data: " + error.message,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const transactions = dashboardData.transactions || [];
    const products = dashboardData.products || [];
    
    const now = new Date();
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      if (timeFilter === "6months") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return transactionDate >= sixMonthsAgo;
      } else if (timeFilter === "1year") {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return transactionDate >= oneYearAgo;
      }
      return true;
    });

    let totalRevenue = 0;
    let totalPurchases = 0;
    let totalSales = 0;

    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.totalAmount) || 0;
      
      if (t.transactionType === "SALE" && t.status === "COMPLETED") {
        totalRevenue += amount;
        totalSales++;
      } else if (t.transactionType === "PURCHASE" && t.status === "COMPLETED") {
        totalPurchases += amount;
      }
    });

    const monthlyData = calculateMonthlyData(filteredTransactions);

    const lowStockProducts = products.filter(p => 
      p.quantity <= p.stockMinimum && p.quantity > 0
    ).length;
    
    const outOfStockProducts = products.filter(p => 
      p.quantity === 0
    ).length;

    setStats({
      totalRevenue,
      totalPurchases,
      totalSales,
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      totalUsers: dashboardData.users.length,
      totalTransactions: filteredTransactions.length,
      monthlyData
    });
  };

  const calculateMonthlyData = (transactions) => {
    const monthlyMap = {};
    
    transactions.forEach(t => {
      const date = new Date(t.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          sales: 0,
          purchases: 0,
          revenue: 0,
          cost: 0,
          transactions: 0
        };
      }
      
      if (t.status === "COMPLETED") {
        monthlyMap[monthKey].transactions++;
        const amount = parseFloat(t.totalAmount) || 0;
        
        if (t.transactionType === "SALE") {
          monthlyMap[monthKey].sales++;
          monthlyMap[monthKey].revenue += amount;
        } else if (t.transactionType === "PURCHASE") {
          monthlyMap[monthKey].purchases++;
          monthlyMap[monthKey].cost += amount;
        }
      }
    });

    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
  };

  const getTopProducts = () => {
    const productSales = {};
    const transactions = dashboardData.transactions || [];
    
    transactions.forEach(t => {
      if (t.transactionType === "SALE" && t.status === "COMPLETED") {
        const productId = t.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: t.productName || "Unknown Product",
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += t.quantity || 0;
        productSales[productId].revenue += parseFloat(t.totalAmount) || 0;
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getCategoryDistribution = () => {
    const categoryMap = {};
    const products = dashboardData.products || [];
    
    products.forEach(p => {
      const categoryName = p.categoryName || "Uncategorized";
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = 0;
      }
      categoryMap[categoryName]++;
    });

    return Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
          <Loader size={40} className="text-teal-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading dashboard analytics...</p>
        </div>
      </Layout>
    );
  }

  const topProducts = getTopProducts();
  const categoryDistribution = getCategoryDistribution();
  const profitMargin = stats.totalRevenue - stats.totalPurchases;

  return (
    <Layout>
      {message && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right ${
          messageType === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500'
            : 'bg-red-50 text-red-800 border-l-4 border-red-500'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600 text-sm">
                {dashboardData.enterprise?.name || "Enterprise"} - Performance Overview
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFilter("6months")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  timeFilter === "6months"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setTimeFilter("1year")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  timeFilter === "1year"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                1 Year
              </button>
              <button
                onClick={() => setTimeFilter("all")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  timeFilter === "all"
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-md">
                <TrendingUp size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalSales} sales</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
                <TrendingDown size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPurchases)}</h3>
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-xs text-gray-500 mt-1">Purchases & costs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                <DollarSign size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(profitMargin)}</h3>
                <p className="text-gray-600 text-sm">Net Profit</p>
                <p className="text-xs text-gray-500 mt-1">
                  Margin: {stats.totalRevenue > 0 ? ((profitMargin / stats.totalRevenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Package size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.lowStockProducts} low, {stats.outOfStockProducts} out
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Revenue & Expenses Trend</h2>
            <p className="text-sm text-gray-600">Track your financial performance over time</p>
          </div>
          
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-pink-500"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <span className="text-sm text-gray-600">Profit</span>
            </div>
          </div>

          {stats.monthlyData.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-64 overflow-x-auto">
              {stats.monthlyData.map((data, index) => {
                const maxValue = Math.max(...stats.monthlyData.map(d => Math.max(d.revenue, d.cost)));
                const revenueHeight = maxValue > 0 ? (data.revenue / maxValue) * 100 : 0;
                const costHeight = maxValue > 0 ? (data.cost / maxValue) * 100 : 0;
                const profit = data.revenue - data.cost;
                const profitHeight = maxValue > 0 ? (Math.abs(profit) / maxValue) * 100 : 0;

                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1 min-w-[60px]">
                    <div className="flex items-end justify-center gap-1 h-48 w-full">
                      <div
                        className="w-4 rounded-t bg-gradient-to-t from-emerald-500 to-green-500 hover:opacity-80 cursor-pointer transition-all"
                        style={{ height: `${revenueHeight}%` }}
                        title={`Revenue: ${formatCurrency(data.revenue)}`}
                      />
                      <div
                        className="w-4 rounded-t bg-gradient-to-t from-red-500 to-pink-500 hover:opacity-80 cursor-pointer transition-all"
                        style={{ height: `${costHeight}%` }}
                        title={`Expenses: ${formatCurrency(data.cost)}`}
                      />
                      <div
                        className="w-4 rounded-t bg-gradient-to-t from-blue-500 to-indigo-500 hover:opacity-80 cursor-pointer transition-all"
                        style={{ height: `${profitHeight}%` }}
                        title={`Profit: ${formatCurrency(profit)}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 text-center">{formatMonth(data.month)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                <p>No transaction data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Top Performing Products</h2>
              <p className="text-sm text-gray-600">Best sellers by revenue</p>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">No sales data available</div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Product Distribution</h2>
              <p className="text-sm text-gray-600">Products by category</p>
            </div>
            {categoryDistribution.length > 0 ? (
              <div className="space-y-4">
                {categoryDistribution.map((cat, index) => {
                  const percentage = stats.totalProducts > 0 ? (cat.count / stats.totalProducts) * 100 : 0;
                  const colors = [
                    'from-teal-500 to-cyan-500',
                    'from-purple-500 to-pink-500',
                    'from-blue-500 to-indigo-500',
                    'from-amber-500 to-orange-500',
                    'from-emerald-500 to-green-500'
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">{cat.name}</span>
                        <span className="text-sm text-gray-600">{cat.count} products</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-right text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">No categories available</div>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.outOfStockProducts > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                    <XCircle size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {stats.outOfStockProducts} Products Out of Stock
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Immediate restocking required</p>
                    <button
                      onClick={() => navigate("/product")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      View Products
                    </button>
                  </div>
                </div>
              </div>
            )}
            {stats.lowStockProducts > 0 && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {stats.lowStockProducts} Products Low on Stock
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Plan restocking soon</p>
                    <button
                      onClick={() => navigate("/product")}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      View Products
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;