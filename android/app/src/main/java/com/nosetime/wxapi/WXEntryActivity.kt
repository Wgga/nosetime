package com.nosetime.wxapi

import android.app.Activity
import android.content.Intent
import android.os.Bundle

class WXEntryActivity : Activity() {
    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            val intent = intent
            val intentToBroadcast = Intent()
            intentToBroadcast.setAction("com.hector.nativewechat.ACTION_REDIRECT_INTENT")
            intentToBroadcast.putExtra("intent", intent)
            sendBroadcast(intentToBroadcast)
            finish()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}