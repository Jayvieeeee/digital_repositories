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
        Schema::create('access_request', function (Blueprint $table) {
            $table->id('request_id');

            $table->unsignedBigInteger('paper_id');
            $table->unsignedBigInteger('academic_year_id');
            $table->unsignedBigInteger('requesting_user_id');

            $table->text('request_message')->nullable();
            $table->string('status')->default('pending');
            $table->text('remarks')->nullable();

            $table->date('request_date')->nullable();
            $table->date('response_date')->nullable();

            $table->timestamps();

            $table->foreign('paper_id')->references('paper_id')->on('research_papers')->onDelete('cascade');

            $table->foreign('academic_year_id')->references('academic_year_id')->on('academic_years')->onDelete('cascade');

            $table->foreign('requesting_user_id')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_request');
    }
};
