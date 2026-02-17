<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('access_requests', function (Blueprint $table) {
            $table->id('request_id');

            $table->foreignId('paper_id')->constrained('research_papers', 'paper_id');
            $table->foreignId('academic_year_id')->constrained('academic_years', 'academic_year_id');
            $table->foreignId('requesting_user_id')->constrained('users', 'user_id');

            $table->text('request_message')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->text('remarks')->nullable();
            $table->date('request_date')->nullable();
            $table->date('response_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request');
    }
};
